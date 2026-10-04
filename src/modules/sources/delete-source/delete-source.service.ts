import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import {
  VECTOR_STORE,
  VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

@Injectable()
export class DeleteSourceService {
  private readonly logger = new Logger(DeleteSourceService.name);

  constructor(
    private readonly sourceRepository: SourceRepository,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(id: string, user: AuthenticatedUser): Promise<void> {
    const source = await this.sourceRepository.findById(id);

    if (!source) {
      throw new NotFoundException('Fonte de conhecimento não encontrada');
    }

    this.accessScope.ensureCan(
      user,
      'source.write',
      { organizationId: source.organization_id },
      'Você não tem acesso a esta fonte de conhecimento.',
    );

    await this.vectorStore.deleteBySourceId(id);
    await this.sourceRepository.delete(id);

    this.logger.log(`Fonte ${id} removida com seus documentos`);
  }
}
