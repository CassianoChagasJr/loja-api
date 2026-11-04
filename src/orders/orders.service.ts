import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order, OrderItem, OrderStatus } from './order.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { DataSource } from 'typeorm';
import { Produto } from '../produtos/produto.entity.js';
import { EnderecoService } from '../endereco/endereco.service.js';

// Perfis que ENXERGAM pedidos de qualquer usuário
const PERFIS_COM_ACESSO_TOTAL = ['ADMIN', 'MANAGER'];
// Perfis que podem ALTERAR/CANCELAR pedido de outro usuário (MANAGER só vê)
const PERFIS_CANCELAM_QUALQUER = ['ADMIN'];
// Perfis que podem marcar o pedido como PAGO "na mão" (o cliente paga pelo pacote Pagamento)
const PERFIS_MARCAM_PAGO = ['ADMIN'];

// Toda a regra de negócio de pedidos fica aqui; o controller só repassa.
@Injectable()
export class OrdersService {
  constructor(
    // Acesso à tabela orders (liberado pelo forFeature no módulo)
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    // Usado para abrir transações (estoque + pedido salvos juntos)
    private readonly dataSource: DataSource,
    // Vem do EnderecoModule (exports): reaproveita a regra "endereço do dono"
    private readonly enderecoService: EnderecoService,
  ) {}

  // Todos os pedidos, do mais novo para o mais antigo (usado por ADMIN/MANAGER)
  async findAll() {
    return this.orderRepository.find({ order: { id: 'DESC' } });
  }

  // Busca um pedido pelo id, SEM regra de dono -> 404 se não existir
  async findOne(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }
    return order;
  }

  // ---------------------------------------------------------------------------
  // POST /orders  -> cria pedido ABERTO e desconta o estoque
  // Tudo numa transação: se um item falhar (404/400), nada é salvo e o estoque volta
  // ---------------------------------------------------------------------------
  async create(dto: CreateOrderDto, userId: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // Pedido em memória; os itens são adicionados no laço abaixo
      const order = manager.create(Order, {
        userId, // dono vem do token (passado pelo controller)
        status: 'ABERTO',
        itens: [],
      });
      for (const itemDto of dto.itens) {
        // 1) Produto precisa existir -> 404
        const produto = await manager.findOne(Produto, {
          where: { id: itemDto.idProduto },
        });
        if (!produto) {
          throw new NotFoundException(
            `Produto ${itemDto.idProduto} não encontrado`,
          );
        }
        // 2) Estoque precisa ser suficiente -> 400 com mensagem de domínio
        if (itemDto.quantidade > produto.estoque) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${itemDto.idProduto}. Quantidade em estoque: ${produto.estoque}`,
          );
        }
        // 3) Desconta o estoque direto no banco (UPDATE estoque = estoque - qtd)
        await manager.decrement(
          Produto,
          { id: produto.id },
          'estoque',
          itemDto.quantidade,
        );
        // 4) Guarda o preço do momento da compra (precoUnico)
        const item = manager.create(OrderItem, {
          idProduto: produto.id,
          quantidade: itemDto.quantidade,
          precoUnico: produto.preco,
        });
        order.itens.push(item);
      }
      // cascade: true na entidade -> salva o pedido e os itens juntos
      return manager.save(order);
    });
  }

  // ---------------------------------------------------------------------------
  // Cancela um pedido ABERTO e devolve o estoque (sem regra de dono;
  // quem chama é o cancelForActor / updateStatusForActor, que já checaram)
  // ---------------------------------------------------------------------------
  async cancel(id: number) {
    return this.dataSource.manager.transaction(async (manager) => {
      // 1) Pedido precisa existir -> 404
      const order = await manager.findOne(Order, { where: { id } });
      if (!order) {
        throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
      }
      // 2) Só pedido ABERTO pode ser cancelado -> 400
      if (order.status != 'ABERTO') {
        throw new BadRequestException(
          `Só pedidos abertos podem ser cancelados`,
        );
      }
      // 3) Devolve ao estoque a quantidade de cada item
      for (const item of order.itens) {
        await manager.increment(
          Produto,
          { id: item.idProduto },
          'estoque',
          item.quantidade,
        );
      }
      // 4) Muda o status e salva (tudo na mesma transação)
      order.status = 'CANCELADO';
      return manager.save(order);
    });
  }

  // ---------------------------------------------------------------------------
  // GET /orders  -> ADMIN/MANAGER veem todos; CLIENTE só os próprios
  // ---------------------------------------------------------------------------
  async findAllForActor(usuarioId: number, perfil: string) {
    if (PERFIS_COM_ACESSO_TOTAL.includes(perfil)) {
      return this.findAll();
    }
    return this.orderRepository.find({
      where: { userId: usuarioId },
      order: { id: 'DESC' },
    });
  }

  // ---------------------------------------------------------------------------
  // GET /orders/:id  -> busca respeitando o dono (reaproveitado em várias regras)
  // CLIENTE tentando pedido de outro -> 404 (não revela que existe)
  // ---------------------------------------------------------------------------
  async findOneForActor(id: number, usuarioId: number, perfil: string) {
    const order = await this.findOne(id);
    if (
      !PERFIS_COM_ACESSO_TOTAL.includes(perfil) &&
      order.userId !== usuarioId
    ) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }
    return order;
  }

  // ---------------------------------------------------------------------------
  // POST /orders/:id/cancel  -> dono ou ADMIN
  // Erros: 404 (pedido de outro, CLIENTE) -> 403 (MANAGER em pedido alheio) -> 400 (não ABERTO)
  // ---------------------------------------------------------------------------
  async cancelForActor(id: number, usuarioId: number, perfil: string) {
    // 1) Busca com regra de dono -> 404
    const order = await this.findOneForActor(id, usuarioId, perfil);
    // 2) MANAGER enxerga, mas não cancela pedido de outro -> 403
    const ehDono = order.userId === usuarioId;
    if (!ehDono && !PERFIS_CANCELAM_QUALQUER.includes(perfil)) {
      throw new ForbiddenException('Você não pode cancelar este pedido');
    }
    // 3) Cancela (o 400 de "não ABERTO" é lançado dentro do cancel)
    return this.cancel(id);
  }

  // ---------------------------------------------------------------------------
  // PATCH /orders/:id/status  -> máquina ABERTO -> PAGO | CANCELADO
  // Erros, nesta ordem: 404 -> 403 (pedido alheio) -> 403 (PAGO sem ser ADMIN) -> 400
  // ---------------------------------------------------------------------------
  async updateStatusForActor(
    id: number,
    usuarioId: number,
    perfil: string,
    novoStatus: OrderStatus,
  ) {
    // 1) Busca com regra de dono -> 404
    const order = await this.findOneForActor(id, usuarioId, perfil);

    // 2) Só o dono ou ADMIN alteram o pedido (MANAGER só vê) -> 403
    const ehDono = order.userId === usuarioId;
    if (!ehDono && !PERFIS_CANCELAM_QUALQUER.includes(perfil)) {
      throw new ForbiddenException('Você não pode alterar este pedido');
    }

    // 3) PAGO "na mão" só pelo ADMIN. O cliente quita pelo pacote Pagamento
    //    (PATCH /pagamentos/:id/status), que muda o pedido na mesma transação.
    //    Sem esta regra, o cliente "pagaria" sem criar pagamento -> 403
    if (novoStatus === 'PAGO' && !PERFIS_MARCAM_PAGO.includes(perfil)) {
      throw new ForbiddenException(
        'Só o ADMIN marca o pedido como PAGO por esta rota. Para pagar, use POST /orders/:id/pagamentos e PATCH /pagamentos/:id/status',
      );
    }

    // 4) Pedido PAGO não pode ser cancelado -> 400
    if (order.status === 'PAGO' && novoStatus === 'CANCELADO') {
      throw new BadRequestException('Pedidos pagos não podem ser cancelados');
    }
    // 5) PAGO e CANCELADO são finais: só sai de ABERTO -> 400
    if (order.status !== 'ABERTO') {
      throw new BadRequestException(
        `Pedido ${order.status} não pode mudar de status`,
      );
    }

    // 6a) CANCELADO: reaproveita o cancel (devolve o estoque)
    if (novoStatus === 'CANCELADO') {
      return this.cancel(id);
    }
    // 6b) PAGO (só ADMIN chega aqui): só muda o status
    if (novoStatus === 'PAGO') {
      order.status = 'PAGO';
      return this.orderRepository.save(order);
    }

    // 7) Qualquer outro alvo (ex.: ABERTO -> ABERTO) -> 400
    throw new BadRequestException('Transição de status inválida');
  }

  // ---------------------------------------------------------------------------
  // PATCH /orders/:id/endereco  -> liga um endereço do usuário a um pedido dele
  // Erros, nesta ordem: 404 (pedido) -> 403 (não é dono) -> 400 (não ABERTO) -> 404 (endereço)
  // ---------------------------------------------------------------------------
  async definirEnderecoForActor(
    id: number,
    enderecoId: number,
    usuarioId: number,
    perfil: string,
  ) {
    // 1) Busca com regra de dono -> 404 para CLIENTE em pedido de outro
    const order = await this.findOneForActor(id, usuarioId, perfil);

    // 2) ADMIN/MANAGER enxergam o pedido, mas só o DONO escolhe onde receber -> 403
    if (order.userId !== usuarioId) {
      throw new ForbiddenException(
        'Só o dono do pedido pode definir o endereço da entrega',
      );
    }

    // 3) Pedido pago/cancelado não muda de endereço -> 400
    if (order.status !== 'ABERTO') {
      throw new BadRequestException(
        `Pedido ${order.status} não pode mudar de endereço`,
      );
    }

    // 4) Endereço precisa ser do mesmo usuário -> 404 (regra do EnderecoService)
    //    Vem depois do pedido: se o pedido não é seu, nem consulta endereço
    const endereco = await this.enderecoService.findOneForUser(
      enderecoId,
      usuarioId,
    );

    // 5) Liga e salva. Coluna e relação apontam para o mesmo id
    order.enderecoId = endereco.id;
    order.endereco = endereco;
    return this.orderRepository.save(order);
  }
}
