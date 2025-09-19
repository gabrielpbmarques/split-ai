import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationEntity } from '../entities';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
  ) {}

  async findOne(
    query: Partial<OrganizationEntity>,
  ): Promise<OrganizationEntity | null> {
    return this.organizationRepository.findOneBy(query);
  }

  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationRepository.find();
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

  async delete(id: string): Promise<boolean> {
    const result = await this.organizationRepository.delete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }
}
