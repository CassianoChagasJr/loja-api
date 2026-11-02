import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type Perfil = 'CLIENTE' | 'ADMIN' | 'MANAGER';

@Entity('users')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'CLIENTE' })
  perfil: Perfil;
}
