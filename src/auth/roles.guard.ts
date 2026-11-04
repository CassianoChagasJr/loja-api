import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEYS } from './roles.decorator.js';

// Guard de AUTORIZAÇÃO ("você pode?"). Roda DEPOIS do JwtAuthGuard,
// porque precisa do req.user.perfil que ele preenche.
@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector lê os metadados gravados pelo @Roles(...)
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1) Papéis exigidos: procura @Roles no método e, se não houver, na classe
    const funcoesNecessarias = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEYS,
      [context.getHandler(), context.getClass()],
    );

    // 2) Rota sem @Roles -> qualquer usuário autenticado passa
    if (!funcoesNecessarias || funcoesNecessarias.length == 0) {
      return true;
    }

    // 3) Perfil do usuário fora da lista -> 403 (está logado, mas não tem permissão)
    const { user } = context.switchToHttp().getRequest();
    if (!user?.perfil || !funcoesNecessarias.includes(user.perfil)) {
      throw new ForbiddenException(
        'Acesso negado: Você não tem permissão para acessar esse recurso',
      );
    }
    return true;
  }
}
