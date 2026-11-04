import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categoria } from '../categorias/entities/categoria.entity.js';

// Tabela "produtos"
@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome: string;

  // numeric(10,2): valor exato com 2 casas (o Postgres devolve como texto, ex. "39.90")
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco: number;

  @Column({ type: 'int', default: 0 })
  estoque: number;

  // Nome do arquivo em ./uploads (null se o produto ainda não tem imagem)
  @Column({ type: 'varchar', length: '255', nullable: true })
  imageFileName: string | null;

  // Coluna com o id da categoria (null = sem categoria)
  @Column({ nullable: true })
  idCategoria: number;

  // Relação N produtos -> 1 categoria. O @JoinColumn usa a MESMA coluna idCategoria.
  // onDelete SET NULL: apagar a categoria não apaga o produto, só limpa o vínculo
  @ManyToOne(() => Categoria, (categoria) => categoria.produtos, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'idCategoria' })
  categoria: Categoria;
}
