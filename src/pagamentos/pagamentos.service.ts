import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { Pagamento } from './pagamento.entity.js';
import type { StatusPagamento } from './pagamento.entity.js';
import { OrdersService } from '../orders/orders.service.js';
import { Order } from '../orders/order.entity.js';
import { CreatePagamentoDto } from './dto/create-pagamento.dto.js';
import { FiltroPagamentosDto } from './dto/filtro-pagamentos.dto.js';

// "Ativo" = ainda vale como cobrança. CANCELADO libera o pedido para um novo pagamento.
const STATUS_ATIVOS: StatusPagamento[] = ['PENDENTE', 'PAGO'];

// Toda a regra de negócio de pagamento fica aqui; o controller só repassa.
@Injectable()
export class PagamentosService {
  constructor(
    // Acesso à tabela pagamentos (liberado pelo forFeature no módulo)
    @InjectRepository(Pagamento)
    private readonly pagamentoRepository: Repository<Pagamento>,
    // Vem do OrdersModule (exports): reaproveita a busca de pedido com regra de dono
    private readonly ordersService: OrdersService,
    // Usado para abrir transação (pagamento + pedido salvos juntos)
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------------------
  // POST /orders/:id/pagamentos  -> cria pagamento PENDENTE
  // Erros, nesta ordem: 404 -> 403 -> 400 (pedido) -> 400 (pagamento ativo)
  // ---------------------------------------------------------------------------
  async createForActor(
    pedidoId: number,
    dto: CreatePagamentoDto,
    usuarioId: number,
    perfil: string,
  ): Promise<Pagamento> {
    // 1) Busca o pedido. CLIENTE tentando pedido de outro -> 404 (lançado lá no OrdersService)
    const pedido = await this.ordersService.findOneForActor(
      pedidoId,
      usuarioId,
      perfil,
    );

    // 2) ADMIN/MANAGER enxergam qualquer pedido, mas só o DONO paga -> 403
    if (pedido.userId !== usuarioId) {
      throw new ForbiddenException('Só o dono do pedido pode pagá-lo');
    }

    // 3) Só pedido ABERTO recebe pagamento (PAGO/CANCELADO não) -> 400
    if (pedido.status !== 'ABERTO') {
      throw new BadRequestException(
        `Pedido ${pedido.status} não pode receber pagamento`,
      );
    }

    // 4) Evita cobrança dupla: procura pagamento PENDENTE ou PAGO deste pedido -> 400
    const ativo = await this.pagamentoRepository.findOne({
      where: { pedidoId, status: In(STATUS_ATIVOS) },
    });
    if (ativo) {
      throw new BadRequestException(
        `Pedido ${pedidoId} já tem um pagamento ativo (pagamento ${ativo.id}, ${ativo.status})`,
      );
    }

    // 5) Valor = soma de (preço x quantidade) dos itens.
    //    precoUnico vem do Postgres como texto, por isso o Number()
    const valor = pedido.itens.reduce(
      (soma, item) => soma + Number(item.precoUnico) * item.quantidade,
      0,
    );

    // 6) Monta e salva. status não é passado: o default da coluna é PENDENTE
    const pagamento = this.pagamentoRepository.create({
      pedidoId,
      userId: pedido.userId,
      metodo: dto.metodo,
      valor: Math.round(valor * 100) / 100, // arredonda para 2 casas
    });
    return this.pagamentoRepository.save(pagamento);
  }

  // ---------------------------------------------------------------------------
  // GET /pagamentos?status=&pedidoId=
  // ADMIN vê todos; CLIENTE e MANAGER só os próprios. Filtros valem para todos.
  // ---------------------------------------------------------------------------
  async findAllForActor(
    filtro: FiltroPagamentosDto,
    usuarioId: number,
    perfil: string,
  ): Promise<Pagamento[]> {
    // Monta o WHERE aos poucos: só entra o filtro que foi enviado
    const where: FindOptionsWhere<Pagamento> = {};

    if (filtro.status) {
      where.status = filtro.status;
    }
    if (filtro.pedidoId !== undefined) {
      // Query string chega como texto (o ValidationPipe não usa transform: true)
      where.pedidoId = Number(filtro.pedidoId);
    }
    // Quem não é ADMIN fica preso aos próprios pagamentos
    if (perfil !== 'ADMIN') {
      where.userId = usuarioId;
    }

    return this.pagamentoRepository.find({ where, order: { id: 'DESC' } });
  }

  // ---------------------------------------------------------------------------
  // Busca UM pagamento respeitando o dono (usado pelo PATCH de status).
  // Não existe OU é de outro usuário -> mesmo 404 (não revela que existe)
  // ---------------------------------------------------------------------------
  async findOneForActor(
    id: number,
    usuarioId: number,
    perfil: string,
  ): Promise<Pagamento> {
    // ADMIN busca só pelo id; os demais por id + userId na mesma consulta
    const where: FindOptionsWhere<Pagamento> =
      perfil === 'ADMIN' ? { id } : { id, userId: usuarioId };

    const pagamento = await this.pagamentoRepository.findOne({ where });
    if (!pagamento) {
      throw new NotFoundException(`Pagamento ${id} não encontrado`);
    }
    return pagamento;
  }

  // ---------------------------------------------------------------------------
  // PATCH /pagamentos/:id/status  -> PENDENTE vira PAGO ou CANCELADO
  // Quem pode: dono do pedido ou ADMIN (garantido pelo findOneForActor acima)
  // ---------------------------------------------------------------------------
  async updateStatusForActor(
    id: number,
    novoStatus: 'PAGO' | 'CANCELADO',
    usuarioId: number,
    perfil: string,
  ): Promise<Pagamento> {
    // 1) Busca com regra de dono -> 404 se não for seu
    const pagamento = await this.findOneForActor(id, usuarioId, perfil);

    // 2) Máquina de estados: só sai de PENDENTE (PAGO e CANCELADO são finais) -> 400
    if (pagamento.status !== 'PENDENTE') {
      throw new BadRequestException(
        `Pagamento ${pagamento.status} não pode mudar de status`,
      );
    }

    // 3a) CANCELADO: só o pagamento muda; o pedido continua ABERTO
    if (novoStatus === 'CANCELADO') {
      pagamento.status = 'CANCELADO';
      return this.pagamentoRepository.save(pagamento);
    }

    // 3b) PAGO: pagamento e pedido mudam JUNTOS, dentro de uma transação.
    //     Se qualquer passo lançar erro, nada é gravado (rollback automático).
    return this.dataSource.transaction(async (manager) => {
      // Relê o pedido dentro da transação para checar o estado atual
      const pedido = await manager.findOne(Order, {
        where: { id: pagamento.pedidoId },
      });
      // Ex.: pedido cancelado depois que o pagamento foi criado -> 400
      if (!pedido || pedido.status !== 'ABERTO') {
        throw new BadRequestException(
          `Pedido ${pagamento.pedidoId} não está ABERTO e não pode ser pago`,
        );
      }

      // Pedido vira PAGO (update direto na coluna, sem mexer nos itens)
      await manager.update(Order, { id: pedido.id }, { status: 'PAGO' });

      // Pagamento vira PAGO
      pagamento.status = 'PAGO';
      return manager.save(pagamento);
    });
  }

  // ---------------------------------------------------------------------------
  // DELETE /pagamentos/:id  -> só ADMIN (checado no controller pelo RolesGuard)
  // ---------------------------------------------------------------------------
  async remove(id: number): Promise<void> {
    const pagamento = await this.pagamentoRepository.findOne({
      where: { id },
    });
    if (!pagamento) {
      throw new NotFoundException(`Pagamento ${id} não encontrado`);
    }
    // remove(entidade): apaga o registro que acabamos de confirmar que existe
    await this.pagamentoRepository.remove(pagamento);
  }
}
