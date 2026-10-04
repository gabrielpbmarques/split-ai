import { Injectable, NotFoundException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import type { SourceEntity } from 'src/infrastructure/database/schema/source.entity';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

@Injectable()
export class GetSourceService {
  constructor(
    private readonly sourceRepository: SourceRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(id: string, user: AuthenticatedUser): Promise<SourceEntity> {
    const source = await this.sourceRepository.findById(id);

    if (!source) {
      throw new NotFoundException('Fonte de conhecimento não encontrada');
    }

    this.accessScope.ensureCan(
      user,
      'source.read',
      { organizationId: source.organization_id },
      'Você não tem acesso a esta fonte de conhecimento.',
    );

    return source;
  }
}
