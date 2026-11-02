import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Categoria } from '../categorias/entities/categoria.entity.js';

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

  @Column({ type: 'varchar', length: '255', nullable: true })
  imageFileName: string | null;

  @Column({nullable: true})
  idCategoria: number

  @ManyToOne(() => Categoria, (categoria) => categoria.produtos, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'idCategoria'})
  categoria: Categoria
}
