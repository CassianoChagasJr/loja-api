import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order } from './order.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(
    dto: CreateOrderDto,
    userId: number | null = null,
  ): Promise<Order> {
    // Criar uma order para salvar
    // para cada item do DTO,
    // - validar se o produto existe
    // - se não existir produto retorna 404
    // - verificar se existe quantidade em estoque
    // - se quantidade em estoque insuficiente retorna 400
    // - se estiver ok, decrementa do estoque e salva a order como ABERTO
    
    return;
  }
}
