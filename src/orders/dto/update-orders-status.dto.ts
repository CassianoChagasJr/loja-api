import { IsIn } from 'class-validator';
import type { OrderStatus } from '../order.entity.js';

export class UpdateOrderStatusDto {
  @IsIn(['ABERTO', 'PAGO', 'CANCELADO'])
  status: OrderStatus;
}
