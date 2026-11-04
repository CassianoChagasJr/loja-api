import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'enderecos' })
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rua: string;
  @Column()
  numero: string;
  @Column({ type: 'varchar', nullable: true })
  complemento: string;
  @Column()
  cidade: string;
  @Column()
  estado: string;
  @Column()
  cep: string;
}
