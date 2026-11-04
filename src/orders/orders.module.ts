import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem } from './order.entity.js';
import { EnderecoModule } from '../endereco/endereco.module.js';

@Module({
  imports: [
    // Libera Repository<Order> e Repository<OrderItem> para injeção
    TypeOrmModule.forFeature([Order, OrderItem]),
    // EnderecoModule exporta o EnderecoService (usado no PATCH /orders/:id/endereco)
    EnderecoModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  // Exporta o service para o PagamentosModule reaproveitar a regra de dono do pedido
  exports: [OrdersService],
})
export class OrdersModule {}
