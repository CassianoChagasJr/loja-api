import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './user.entity.js';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async registro(username: string, email: string, password: string) {
    // verificar se o usuario existe
    // se existir, retornar erro
    // cifrar a senha do usuário
    // salvar o usuario com a senha cifrada no banco de dados
    // retornar os dados do usuário sem a senha

    const exists = await this.usuarioRepository.findOne({
      where: [{ username }, { email }],
    });
    if (exists) {
      throw new ConflictException(`username ou email já cadastrado`);
    }

    const senhaCifrada = await bcrypt.hash(password, 10);

    const usuario = this.usuarioRepository.create({
      username,
      email,
      password: senhaCifrada,
      perfil: 'CLIENTE',
    });
    const usuarioSalvo = await this.usuarioRepository.save(usuario);
    const { password: _, ...user_sem_senha } = usuarioSalvo;
    return user_sem_senha;
  }
}
