import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { AgentEntity } from 'src/entities';
import {
  OrganizationFeatureRepository,
  OrganizationRepository,
} from 'src/repositories';
import { env } from 'src/shared/config/env';
import { z } from 'zod';

import { LoadDatabaseToolService } from '../LoadDatabaseTool/load-database-tool.service';

const DATABASE_CONNECTION_FEATURE_KEY = 'database_connection';

@Injectable()
export class MaybeLoadDatabaseToolService {
  constructor(
    private readonly loadDatabaseToolService: LoadDatabaseToolService,
    private readonly organizationFeatureRepository: OrganizationFeatureRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    organizationId: string,
    scopeCompanyId?: string,
    agent?: AgentEntity,
  ): Promise<DynamicStructuredTool<z.ZodObject<any>> | null> {
    const feature = await this.organizationFeatureRepository.getEnabledFeature(
      organizationId,
      DATABASE_CONNECTION_FEATURE_KEY,
    );
    if (!feature) {
      return null;
    }

    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization?.database_url) {
      return null;
    }

    const featureConfig = (feature.config ?? {}) as {
      tables?: string[];
      sampleRows?: number;
    };

    const scopeRequired =
      !!agent &&
      (env.BRAVOHUB_SCOPED_AGENTS.includes(agent.id) ||
        (!!agent.agent_identifier &&
          env.BRAVOHUB_SCOPED_AGENTS.includes(agent.agent_identifier)));

    return this.loadDatabaseToolService.execute({
      databaseUrl: organization.database_url,
      includeTables: featureConfig.tables?.length
        ? featureConfig.tables
        : undefined,
      sampleRows:
        typeof featureConfig.sampleRows === 'number'
          ? featureConfig.sampleRows
          : undefined,
      readOnly: !!scopeCompanyId || scopeRequired,
      scope: scopeCompanyId
        ? { column: 'company_id', value: scopeCompanyId }
        : undefined,
      scopeRequired,
    });
  }
}
