import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Estratégia "jwt" do Passport: é ela que o JwtAuthGuard executa em cada rota protegida
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Lê o token do header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Token expirado é rejeitado (401)
      ignoreExpiration: false,
      // Mesmo segredo usado para assinar o acesso_token no login
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Só roda se o token for válido. O que retornar vira o req.user
  // usado em todos os controllers (req.user.usuarioId, req.user.perfil)
  validate(payload: { sub: number; username: string; perfil: string }) {
    return {
      usuarioId: payload.sub,
      username: payload.username,
      perfil: payload.perfil,
    };
  }
}
