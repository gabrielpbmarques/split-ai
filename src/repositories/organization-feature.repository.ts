import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationFeatureEntity } from '../entities';

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
