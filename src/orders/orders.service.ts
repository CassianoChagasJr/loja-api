import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order, OrderItem } from './order.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { DataSource } from 'typeorm';
import { Produto } from '../produtos/produto.entity.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
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
    // Criar uma order para salvar
    // para cada item do DTO,
    // - validar se o produto existe
    // - se não existir produto retorna 404
    // - verificar se existe quantidade em estoque
    // - se quantidade em estoque insuficiente retorna 400
    // - se estiver ok, decrementa do estoque e salva a order como ABERTO

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
  }
}
