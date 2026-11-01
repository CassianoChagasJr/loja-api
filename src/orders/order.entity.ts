import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity.js';

export type OrderStatus = 'ABERTO' | 'PAGO' | 'CANCELADO';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 20, default: 'ABERTO' })
  status: OrderStatus;

  @CreateDateColumn()
  dataCriacao: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  itens: OrderItem[];
}
