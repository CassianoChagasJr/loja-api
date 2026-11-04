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
import { ConfigService } from '@nestjs/config';

// Regras de autenticação: cadastro, login, /me e refresh.
@Injectable()
export class AuthService {
  constructor(
    // Acesso à tabela users
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    // Assina e verifica tokens (configurado no AuthModule com JWT_SECRET)
    private readonly jwtService: JwtService,
    // Lê variáveis do .env (JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN)
    private readonly config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------------
  // POST /auth/registro  -> cria usuário CLIENTE com senha cifrada
  // ---------------------------------------------------------------------------
  async registro(username: string, email: string, password: string) {
    // 1) username ou email já usados -> 409
    const exists = await this.usuarioRepository.findOne({
      where: [{ username }, { email }], // array no where = OR
    });
    if (exists) {
      throw new ConflictException(`username ou email já cadastrado`);
    }

    // 2) Nunca salvar senha pura: bcrypt gera um hash (10 = custo/rodadas)
    const senhaCifrada = await bcrypt.hash(password, 10);

    // 3) Todo cadastro público nasce CLIENTE (ADMIN/MANAGER só pelo seed/banco)
    const usuario = this.usuarioRepository.create({
      username,
      email,
      password: senhaCifrada,
      perfil: 'CLIENTE',
    });
    const usuarioSalvo = await this.usuarioRepository.save(usuario);
    // 4) Devolve o usuário SEM o campo password (desestruturação)
    const { password: _, ...user_sem_senha } = usuarioSalvo;
    return user_sem_senha;
  }

  // ---------------------------------------------------------------------------
  // POST /auth/login  -> devolve acesso_token (curto) e refresh_token (longo)
  // ---------------------------------------------------------------------------
  async login(username: string, password: string) {
    // 1) Usuário inexistente ou senha errada -> mesmo 401 (não revela qual dos dois)
    const usuario = await this.usuarioRepository.findOne({
      where: { username },
    });
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      throw new UnauthorizedException(`credenciais inválidas`);
    }

    // 2) Payload do token de acesso: sub (id), username e perfil.
    //    O JwtStrategy transforma isso no req.user = { usuarioId, username, perfil }
    const payload = {
      sub: usuario.id,
      username: usuario.username,
      perfil: usuario.perfil,
    };

    // 3) acesso_token: assinado com JWT_SECRET (configuração padrão do JwtModule)
    const acessoToken = await this.jwtService.signAsync(payload);
    // 4) refresh_token: só o id, com SEGREDO e validade PRÓPRIOS
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

  // ---------------------------------------------------------------------------
  // GET /auth/me  -> dados do usuário logado (id vem do token, via req.user)
  // ---------------------------------------------------------------------------
  async me(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    // Token válido, mas usuário apagado do banco -> 401
    if (!usuario) {
      throw new UnauthorizedException('usuário não encontrado');
    }

    // Escolhe os campos de propósito: a senha nunca sai
    return {
      usuarioId: usuario.id,
      username: usuario.username,
      email: usuario.email,
      perfil: usuario.perfil,
    };
  }

  // ---------------------------------------------------------------------------
  // POST /auth/refresh  -> troca um refresh_token válido por um novo acesso_token
  // ---------------------------------------------------------------------------
  async refresh(refreshToken: string) {
    // 1) Verifica assinatura e validade com o segredo do REFRESH.
    //    Um acesso_token aqui falha, porque foi assinado com outro segredo -> 401
    let payload: { sub: number };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: number }>(
        refreshToken,
        { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET') },
      );
    } catch {
      throw new UnauthorizedException('refresh token inválido ou expirado');
    }

    // 2) Usuário ainda existe? -> 401 se não
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub },
    });
    if (!usuario) {
      throw new UnauthorizedException('usuário não encontrado');
    }

    // 3) Monta o payload com o perfil ATUAL do banco e assina um novo acesso_token
    const novoPayload = {
      sub: usuario.id,
      username: usuario.username,
      perfil: usuario.perfil,
    };

    return {
      acesso_token: await this.jwtService.signAsync(novoPayload),
    };
  }
}
