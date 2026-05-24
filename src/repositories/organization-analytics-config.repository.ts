import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationAnalyticsConfigEntity } from 'src/entities/organization-analytics-config.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrganizationAnalyticsConfigRepository {
  constructor(
    @InjectRepository(OrganizationAnalyticsConfigEntity)
    private readonly repository: Repository<OrganizationAnalyticsConfigEntity>,
  ) {}

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationAnalyticsConfigEntity | null> {
    return this.repository.findOne({
      where: { organization_id: organizationId },
    });
  }

  async create(
    data: Partial<OrganizationAnalyticsConfigEntity>,
  ): Promise<OrganizationAnalyticsConfigEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(
    id: string,
    data: Partial<OrganizationAnalyticsConfigEntity>,
  ): Promise<void> {
    await this.repository.update(id, data);
  }

  async upsertByOrganizationId(
    organizationId: string,
    data: Partial<OrganizationAnalyticsConfigEntity>,
  ): Promise<OrganizationAnalyticsConfigEntity> {
    const existing = await this.findByOrganizationId(organizationId);
    if (existing) {
      await this.update(existing.id, data);
      return (await this.findByOrganizationId(organizationId))!;
    }
    return this.create({ ...data, organization_id: organizationId });
  }
}
