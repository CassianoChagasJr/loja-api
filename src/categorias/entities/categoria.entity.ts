import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Produto } from '../../produtos/produto.entity.js';

// Tabela "categorias"
@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  // Lado 1 da relação 1 categoria -> N produtos (a FK idCategoria fica em produtos).
  // Não cria coluna; serve para carregar os produtos com relations: { produtos: true }
  @OneToMany(() => Produto, (produto) => produto.categoria)
  produtos: Produto[];
}
