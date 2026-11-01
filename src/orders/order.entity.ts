import { OrderItem } from './order-item.entity.js';

export class Order {
  id: number;
  userId: number;
  status: string;
  dataCriacao: Date;
  itens: OrderItem[];
}
