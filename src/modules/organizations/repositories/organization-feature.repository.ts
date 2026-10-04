import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationFeatureEntity } from 'src/infrastructure/database/schema';

@Injectable()
export class OrganizationFeatureRepository {
  constructor(
    @InjectRepository(OrganizationFeatureEntity)
    private readonly repository: Repository<OrganizationFeatureEntity>,
  ) {}

  async isEnabledForOrganization(
    organizationId: string,
    featureKey: string,
  ): Promise<boolean> {
    const row = await this.repository
      .createQueryBuilder('of')
      .innerJoin('of.feature', 'feature')
      .where('of.organization_id = :organizationId', { organizationId })
      .andWhere('feature.key = :featureKey', { featureKey })
      .andWhere('of.enabled = true')
      .getOne();

    return !!row;
  }

  /**
   * Returns the enabled `organization_features` row for a feature key — including
   * its `config` payload — or null when the feature is absent or disabled. Lets a
   * caller gate on the feature and read its per-org config in a single lookup
   * (e.g. the `database_connection` table allow-list consumed by ResolveAgent).
   */
  async getEnabledFeature(
    organizationId: string,
    featureKey: string,
  ): Promise<OrganizationFeatureEntity | null> {
    return this.repository
      .createQueryBuilder('of')
      .innerJoin('of.feature', 'feature')
      .where('of.organization_id = :organizationId', { organizationId })
      .andWhere('feature.key = :featureKey', { featureKey })
      .andWhere('of.enabled = true')
      .getOne();
  }

  async findByOrganization(
    organizationId: string,
  ): Promise<OrganizationFeatureEntity[]> {
    return this.repository.find({
      where: { organization_id: organizationId },
      relations: ['feature'],
    });
  }

  async upsert(
    organizationId: string,
    featureId: string,
    data: Partial<Pick<OrganizationFeatureEntity, 'enabled' | 'config'>>,
  ): Promise<OrganizationFeatureEntity> {
    const existing = await this.repository.findOne({
      where: { organization_id: organizationId, feature_id: featureId },
    });

    if (existing) {
      Object.assign(existing, data);
      return this.repository.save(existing);
    }

    const row = this.repository.create({
      organization_id: organizationId,
      feature_id: featureId,
      enabled: data.enabled ?? false,
      config: data.config ?? null,
    });
    return this.repository.save(row);
  }
}
