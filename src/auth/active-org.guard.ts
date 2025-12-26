import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AgentEntity } from 'src/entities/agent.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ActiveOrgGuard implements CanActivate {
  constructor(private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    if (user.organization && user.organization.status === 'inactive') {
      throw new ForbiddenException(
        'Sua organização está inativa. Entre em contato com o administrador para renovar o plano ou adquirir créditos.',
      );
    }

    if (!user.organization || !user.organization_id) {
      const agentId = request.body?.agentId || request.query?.agentId;

      if (agentId) {
        const agentRepository = this.dataSource.getRepository(AgentEntity);
        const agent = await agentRepository.findOne({
          where: { id: agentId },
          relations: ['organization'],
        });

        if (
          agent &&
          agent.organization &&
          agent.organization.status === 'inactive'
        ) {
          throw new ForbiddenException(
            'A organização responsável por este agente está inativa.',
          );
        }
      }
    }

    return true;
  }
}
