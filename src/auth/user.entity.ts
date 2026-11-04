import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tipo fechado: os três papéis do sistema
export type Perfil = 'CLIENTE' | 'ADMIN' | 'MANAGER';

// Tabela "users"
@Entity('users')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  // unique: o banco recusa dois usuários com o mesmo username/email
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  // Hash bcrypt, nunca a senha pura
  @Column()
  password: string;

  // Papel usado pelo RolesGuard. Cadastro público nasce CLIENTE
  @Column({ default: 'CLIENTE' })
  perfil: Perfil;
}
