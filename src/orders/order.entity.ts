import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  itens: OrderItem[];
}

@Entity('order_itens')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idProduto: number;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precoUnico: number;

  @ManyToOne(() => Order, (order) => order.itens)
  order: Order;
}
