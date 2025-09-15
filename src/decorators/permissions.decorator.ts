import { SetMetadata } from '@nestjs/common';

/**
 * Chave para armazenar os metadados de permissões
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Interface para definir a permissão necessária
 */
export interface RequiredPermission {
  resource: string;
  action: 'read' | 'write';
}

/**
 * Decorator para definir as permissões necessárias para acessar um endpoint
 *
 * @example
 * @UseGuards(AuthGuard, PermissionsGuard)
 * @Permissions({ resource: 'jobs', action: 'write' })
 * async createJob() {
 *   // Somente usuários com permissão de escrita no recurso 'jobs' podem acessar
 * }
 *
 * @example
 * @UseGuards(AuthGuard, PermissionsGuard)
 * @Permissions({ resource: 'activities', action: 'read' }, { resource: 'jobs', action: 'read' })
 * async getActivities() {
 *   // Somente usuários com permissão de leitura nos recursos 'activities' e 'jobs' podem acessar
 * }
 */
export const Permissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
