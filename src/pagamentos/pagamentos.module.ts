import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pagamento } from './pagamento.entity.js';
import { PagamentosService } from './pagamentos.service.js';
import { PagamentosController } from './pagamentos.controller.js';
import { OrdersModule } from '../orders/orders.module.js';

@Module({
  imports: [
    // Libera o Repository<Pagamento> para injeção no service
    TypeOrmModule.forFeature([Pagamento]),
    // OrdersModule exporta o OrdersService: reaproveitamos a regra de dono do pedido
    OrdersModule,
  ],
  controllers: [PagamentosController],
  providers: [PagamentosService],
})
export class PagamentosModule {}
