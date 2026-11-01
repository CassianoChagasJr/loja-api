import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco: number;

  @Column({ type: 'int', default: 0 })
  estoque: number;
}
