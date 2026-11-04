import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard de AUTENTICAÇÃO ("quem é você?").
// Executa a estratégia "jwt" (JwtStrategy): sem token, token inválido ou expirado -> 401.
// Se passar, preenche o req.user.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
