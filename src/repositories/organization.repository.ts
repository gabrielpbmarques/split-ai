import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { OrganizationEntity } from '../entities';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
  ) {}

  async findOne(
    where:
      | FindOptionsWhere<OrganizationEntity>
      | FindOptionsWhere<OrganizationEntity>[],
  ): Promise<OrganizationEntity | null> {
    return this.organizationRepository.findOne({ where });
  }

  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationRepository.find();
  }

  async findWithFilters(filters: {
    name?: string;
    acronym?: string;
    email_domain?: string;
    contact_name?: string;
    contact_email?: string;
    status?: string;
    plan?: string;
    activated_at?: string;
  }): Promise<OrganizationEntity[]> {
    const queryBuilder =
      this.organizationRepository.createQueryBuilder('organization');

    queryBuilder.leftJoinAndSelect('organization.plan', 'plan');

    if (filters.name) {
      queryBuilder.andWhere('organization.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.acronym) {
      queryBuilder.andWhere('organization.acronym ILIKE :acronym', {
        acronym: `%${filters.acronym}%`,
      });
    }

    if (filters.email_domain) {
      queryBuilder.andWhere('organization.email_domain ILIKE :email_domain', {
        email_domain: `%${filters.email_domain}%`,
      });
    }

    if (filters.contact_name) {
      queryBuilder.andWhere('organization.contact_name ILIKE :contact_name', {
        contact_name: `%${filters.contact_name}%`,
      });
    }

    if (filters.contact_email) {
      queryBuilder.andWhere('organization.contact_email ILIKE :contact_email', {
        contact_email: `%${filters.contact_email}%`,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('organization.status = :status', {
        status: filters.status,
      });
    }

    if (filters.plan) {
      queryBuilder.andWhere('(plan.type = :plan OR plan.name ILIKE :plan)', {
        plan: filters.plan,
      });
    }

    if (filters.activated_at) {
      queryBuilder.andWhere('DATE(organization.activated_at) = :activated_at', {
        activated_at: filters.activated_at,
      });
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    return this.organizationRepository.findOneBy({ id });
  }

  async findByEmailDomain(
    emailDomain: string,
  ): Promise<OrganizationEntity | null> {
    return this.organizationRepository.findOneBy({ email_domain: emailDomain });
  }

  async create(data: Partial<OrganizationEntity>): Promise<OrganizationEntity> {
    const organization = this.organizationRepository.create(data);
    return this.organizationRepository.save(organization);
  }

  async update(
    id: string,
    data: Partial<OrganizationEntity>,
  ): Promise<OrganizationEntity | null> {
    await this.organizationRepository.update(id, data);
    return this.findById(id);
  }

  async updateEmbedSettings(
    id: string,
    data: Partial<
      Pick<
        OrganizationEntity,
        | 'chat_embed_enabled'
        | 'chat_embed_agent_id'
        | 'chat_embed_primary_color'
        | 'chat_embed_button_position'
        | 'chat_embed_greeting'
        | 'chat_embed_welcome_enabled'
      >
    >,
  ): Promise<OrganizationEntity | null> {
    await this.organizationRepository.update(id, data);
    return this.findById(id);
  }

  async findByEmbedToken(token: string): Promise<OrganizationEntity | null> {
    return this.organizationRepository.findOne({
      where: { chat_embed_token: token },
    });
  }

  async findActiveByEmbedToken(
    token: string,
  ): Promise<OrganizationEntity | null> {
    return this.organizationRepository.findOne({
      where: { chat_embed_token: token, chat_embed_enabled: true },
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.organizationRepository.delete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }
}
