import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Endereco } from '../endereco/endereco.entity.js';

// Tipo fechado: o TypeScript só aceita esses três status
export type OrderStatus = 'ABERTO' | 'PAGO' | 'CANCELADO';

// Tabela "orders" (pedido)
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // Dono do pedido (vem do token na criação). Relação 1xN lógica com users, sem FK
  @Column({ type: 'int' })
  userId: number;

  // Endereço de entrega; null até o cliente usar PATCH /orders/:id/endereco
  @Column({ type: 'int', nullable: true })
  enderecoId: number | null;

  // Relação N pedidos -> 1 endereço. O @JoinColumn usa a MESMA coluna enderecoId.
  // onDelete SET NULL: apagar o endereço deixa o pedido com enderecoId = null
  @ManyToOne(() => Endereco, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enderecoId' })
  endereco: Endereco | null;

  // Todo pedido nasce ABERTO
  @Column({ type: 'varchar', length: 20, default: 'ABERTO' })
  status: OrderStatus;

  // Preenchida automaticamente pelo TypeORM no INSERT
  @CreateDateColumn()
  dataCriacao: Date;

  // 1 pedido -> N itens.
  // cascade: salvar o pedido salva os itens; eager: sempre carrega os itens junto
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  itens: OrderItem[];
}

// Tabela "order_itens" (cada linha = um produto dentro de um pedido)
@Entity('order_itens')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  // Id do produto comprado (relação lógica, sem FK)
  @Column()
  idProduto: number;

  @Column({ type: 'int' })
  quantidade: number;

  // Preço no momento da compra (não muda se o produto mudar de preço depois)
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precoUnico: number;

  // Lado N da relação com Order (cria a FK orderId)
  @ManyToOne(() => Order, (order) => order.itens)
  order: Order;
}
