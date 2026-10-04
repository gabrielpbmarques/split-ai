import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { SUPABASE_CLIENT } from 'src/infrastructure/supabase/supabase.tokens';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

@Injectable()
export class DeleteSourceService {
  private readonly logger = new Logger(DeleteSourceService.name);

  constructor(
    private readonly sourceRepository: SourceRepository,
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
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

    // Delete documents from Supabase vector store first
    const { error } = await this.supabaseClient
      .from('documents')
      .delete()
      .eq('metadata->>source_id', id);

    if (error) {
      this.logger.error(
        `Failed to delete documents from vector store: ${error.message}`,
      );
    } else {
      this.logger.log(`Deleted documents with source_id: ${id}`);
    }

    // Delete source from PostgreSQL
    await this.sourceRepository.delete(id);

    this.logger.log(`Deleted source: ${id}`);
  }
}
