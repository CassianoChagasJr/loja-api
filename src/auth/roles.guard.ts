import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEYS } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const funcoesNecessarias = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEYS,
      [context.getHandler(), context.getClass()],
    );

    if (!funcoesNecessarias || funcoesNecessarias.length == 0) {
      return true;
    }

    const { usuario } = context.switchToHttp().getRequest();
    if (!usuario?.perfil || !funcoesNecessarias.includes(usuario.perfil)) {
      throw new ForbiddenException(
        'Acesso negado: Você não tem permissão para acessar esse recurso',
      );
    }
    return true;
  }
}
