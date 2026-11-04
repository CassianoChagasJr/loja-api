import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Produto } from './produto.entity.js';

// Tabela "produto_imagens": a GALERIA (cap. 9). Cada linha = uma imagem de um produto.
// Diferente do campo imageFileName do Produto (linha P), que guarda UMA imagem só.
@Entity('produto_imagens')
export class ProdutoImagem {
  @PrimaryGeneratedColumn()
  id: number;

  // Coluna com o id do produto dono da imagem
  @Column({ type: 'int' })
  produtoId: number;

  // Relação N imagens -> 1 produto. O @JoinColumn usa a MESMA coluna produtoId (FK).
  // onDelete CASCADE: apagar o produto apaga as linhas da galeria dele
  @ManyToOne(() => Produto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'produtoId' })
  produto: Produto;

  // Nome do arquivo salvo em ./uploads
  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  // Tipo do arquivo (image/jpeg ou image/png) e tamanho em bytes, informados pelo multer
  @Column({ type: 'varchar', length: 50 })
  mimeType: string;

  @Column({ type: 'int' })
  tamanho: number;

  // Preenchida automaticamente pelo TypeORM no INSERT
  @CreateDateColumn()
  dataCriacao: Date;
}
