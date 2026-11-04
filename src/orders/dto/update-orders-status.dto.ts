import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { OrderStatus } from '../order.entity.js';

// Body do PATCH /orders/:id/status -> { "status": "PAGO" | "CANCELADO" }
// As regras de transição (quem pode e de onde para onde) ficam no OrdersService
export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['ABERTO', 'PAGO', 'CANCELADO'], example: 'CANCELADO' })
  // Valor fora da lista -> 400 automático (ValidationPipe)
  @IsIn(['ABERTO', 'PAGO', 'CANCELADO'])
  status: OrderStatus;
}
