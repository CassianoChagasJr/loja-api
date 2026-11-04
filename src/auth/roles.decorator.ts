import { SetMetadata } from '@nestjs/common';

// Chave usada para guardar/ler os papéis exigidos pela rota
export const ROLES_KEYS = 'roles';

// @Roles('ADMIN', 'MANAGER'): anota na rota quais perfis podem chamá-la.
// Quem lê essa anotação é o RolesGuard.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEYS, roles);
