import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem } from './order.entity.js';
import { EnderecoModule } from '../endereco/endereco.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), EnderecoModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
