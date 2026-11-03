import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './user.entity.js';
import { Repository } from 'typeorm';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IsEmail } from 'class-validator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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

  async login(username: string, password: string) {
    // buscar o usuário no banco
    // verificar senha
    // retornar erro se senha invalida
    // gerar token jwt e retornar se a senha for valida
    // retornar token jwt se senha valida

    const usuario = await this.usuarioRepository.findOne({
      where: { username },
    });
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      throw new UnauthorizedException(`credenciais inválidas`);
    }

    const payload = {
      sub: usuario.id,
      username: usuario.username,
      perfil: usuario.perfil,
    };

    const acessoToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { sub: usuario.id },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow<JwtSignOptions['expiresIn']>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      },
    );

    return {
      acesso_token: acessoToken,
      refresh_token: refreshToken,
    };
  }

  async me(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new UnauthorizedException('usuário não encontrado');
    }

    return {
      usuarioId: usuario.id,
      username: usuario.username,
      email: usuario.email,
      perfil: usuario.perfil,
    };
  }
}
