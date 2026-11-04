import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { OrderStatus } from '../order.entity.js';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['ABERTO', 'PAGO', 'CANCELADO'], example: 'PAGO' })
  @IsIn(['ABERTO', 'PAGO', 'CANCELADO'])
  status: OrderStatus;
}
