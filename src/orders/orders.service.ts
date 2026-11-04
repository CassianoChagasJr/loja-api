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

const PERFIS_COM_ACESSO_TOTAL = ['ADMIN', 'MANAGER'];
const PERFIS_CANCELAM_QUALQUER = ['ADMIN'];

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly enderecoService: EnderecoService,
  ) {}

  async findAll() {
    return this.orderRepository.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }
    return order;
  }

  async create(dto: CreateOrderDto, userId: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        userId,
        status: 'ABERTO',
        itens: [],
      });
      for (const itemDto of dto.itens) {
        const produto = await manager.findOne(Produto, {
          where: { id: itemDto.idProduto },
        });
        if (!produto) {
          throw new NotFoundException(
            `Produto ${itemDto.idProduto} não encontrado`,
          );
        }
        if (itemDto.quantidade > produto.estoque) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${itemDto.idProduto}. Quantidade em estoque: ${produto.estoque}`,
          );
        }
        await manager.decrement(
          Produto,
          { id: produto.id },
          'estoque',
          itemDto.quantidade,
        );
        const item = manager.create(OrderItem, {
          idProduto: produto.id,
          quantidade: itemDto.quantidade,
          precoUnico: produto.preco,
        });
        order.itens.push(item);
      }
      return manager.save(order);
    });
    // Criar uma order para salvar
    // para cada item do DTO,
    // - validar se o produto existe
    // - se não existir produto retorna 404
    // - verificar se existe quantidade em estoque
    // - se quantidade em estoque insuficiente retorna 400
    // - se estiver ok, decrementa do estoque e salva a order como ABERTO
  }

  async cancel(id: number) {
    return this.dataSource.manager.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id } });
      if (!order) {
        throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
      }
      if (order.status != 'ABERTO') {
        throw new BadRequestException(
          `Só pedidos abertos podem ser cancelados`,
        );
      }
      for (const item of order.itens) {
        await manager.increment(
          Produto,
          { id: item.idProduto },
          'estoque',
          item.quantidade,
        );
      }
      order.status = 'CANCELADO';
      return manager.save(order);
    });

    // buscar a order por id
    // se não retornar nada, erro 404
    // se retornou, verifica se o status é diferente de ABERTO, caso sim, erro 400
    // para cada item, devolver a quantidade pro estoque
    // muidar status da order para CANCELADO
    // salvar
  }

  async findAllForActor(usuarioId: number, perfil: string) {
    if (PERFIS_COM_ACESSO_TOTAL.includes(perfil)) {
      return this.findAll();
    }
    return this.orderRepository.find({
      where: { userId: usuarioId },
      order: { id: 'DESC' },
    });
  }

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

  async cancelForActor(id: number, usuarioId: number, perfil: string) {
    const order = await this.findOneForActor(id, usuarioId, perfil);
    const ehDono = order.userId === usuarioId;
    if (!ehDono && !PERFIS_CANCELAM_QUALQUER.includes(perfil)) {
      throw new ForbiddenException('Você não pode cancelar este pedido');
    }
    return this.cancel(id);
  }

  async updateStatusForActor(
    id: number,
    usuarioId: number,
    perfil: string,
    novoStatus: OrderStatus,
  ) {
    const order = await this.findOneForActor(id, usuarioId, perfil);

    const ehDono = order.userId === usuarioId;
    if (!ehDono && !PERFIS_CANCELAM_QUALQUER.includes(perfil)) {
      throw new ForbiddenException('Você não pode alterar este pedido');
    }

    if (order.status === 'PAGO' && novoStatus === 'CANCELADO') {
      throw new BadRequestException('Pedidos pagos não podem ser cancelados');
    }
    if (order.status !== 'ABERTO') {
      throw new BadRequestException(
        `Pedido ${order.status} não pode mudar de status`,
      );
    }

    if (novoStatus === 'CANCELADO') {
      return this.cancel(id);
    }
    if (novoStatus === 'PAGO') {
      order.status = 'PAGO';
      return this.orderRepository.save(order);
    }

    throw new BadRequestException('Transição de status inválida');
  }

  async definirEnderecoForActor(
    id: number,
    enderecoId: number,
    usuarioId: number,
    perfil: string,
  ) {
    const order = await this.findOneForActor(id, usuarioId, perfil);

    if (order.userId !== usuarioId) {
      throw new ForbiddenException(
        'Só o dono do pedido pode definir o endereço da entrega',
      );
    }

    if (order.status !== 'ABERTO') {
      throw new BadRequestException(
        `Pedido ${order.status} não pode mudar de endereço`,
      );
    }

    const endereco = await this.enderecoService.findOneForUser(
      enderecoId,
      usuarioId,
    );

    order.enderecoId = endereco.id;
    order.endereco = endereco;
    return this.orderRepository.save(order);
  }
}
