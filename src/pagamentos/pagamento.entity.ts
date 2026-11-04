import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../orders/order.entity.js';

// Tipos fechados: o TypeScript só aceita esses valores
export type MetodoPagamento = 'CARTAO' | 'BOLETO' | 'PIX';
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';

// Mesmas listas em formato de array, usadas pelos DTOs (@IsIn) e pelo Swagger (enum)
export const METODOS_PAGAMENTO: MetodoPagamento[] = ['CARTAO', 'BOLETO', 'PIX'];
export const STATUS_PAGAMENTO: StatusPagamento[] = [
  'PENDENTE',
  'PAGO',
  'CANCELADO',
];

// Tabela "pagamentos". Pagamento fake: só grava no banco, sem gateway externo.
@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn()
  id: number;

  // Coluna com o id do pedido pago
  @Column({ type: 'int' })
  pedidoId: number;

  // Relação N pagamentos -> 1 pedido. O @JoinColumn usa a MESMA coluna pedidoId,
  // então o banco cria a chave estrangeira (FK) para orders.id
  @ManyToOne(() => Order)
  @JoinColumn({ name: 'pedidoId' })
  pedido: Order;

  // Dono do pagamento = dono do pedido (copiado na criação).
  // Assim o "só os meus pagamentos" é um simples where: { userId }
  @Column({ type: 'int' })
  userId: number;

  // Definido na criação e nunca mais alterado (o DTO do PATCH não tem esse campo)
  @Column({ type: 'varchar', length: 10 })
  metodo: MetodoPagamento;

  // Todo pagamento nasce PENDENTE
  @Column({ type: 'varchar', length: 10, default: 'PENDENTE' })
  status: StatusPagamento;

  // O Postgres devolve numeric como texto ("70.00"); o transformer converte para número
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (valor: number) => valor,
      from: (valor: string) => Number(valor),
    },
  })
  valor: number;

  // Preenchida automaticamente pelo TypeORM no INSERT
  @CreateDateColumn()
  dataCriacao: Date;
}
