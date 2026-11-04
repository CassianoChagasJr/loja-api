import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tabela "enderecos"
@Entity({ name: 'enderecos' })
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  // Dono do endereço (vem do token, nunca do body).
  // Relação 1 usuário -> N endereços, lógica (sem FK), mesmo padrão do Order
  @Column({ type: 'int' })
  userId: number;

  @Column()
  rua: string;

  // Texto e não número: aceita "123A", "S/N"
  @Column()
  numero: string;

  // Único campo opcional
  @Column({ type: 'varchar', nullable: true })
  complemento: string | null;

  @Column()
  bairro: string;

  @Column()
  cidade: string;

  @Column()
  estado: string;

  // Texto: mantém o zero à esquerda e o hífen ("01000-000")
  @Column()
  cep: string;
}
