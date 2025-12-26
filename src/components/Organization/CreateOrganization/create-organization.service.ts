import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { OrganizationEntity } from 'src/entities/organization.entity';
import { PlanType } from 'src/entities/plan.entity';
import { OrganizationRepository, PlanRepository } from 'src/repositories';
import { User } from 'src/types';

import { CreateOrganizationDto } from './create-organization.dto';

@Injectable()
export class CreateOrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(dto: CreateOrganizationDto, user: User) {
    let plan;

    if (dto.planId) {
      plan = await this.planRepository.findById(dto.planId);
    } else {
      const planType = dto.plan || PlanType.STARTER;
      plan = await this.planRepository.findByType(planType);
    }

    if (!plan) {
      throw new BadRequestException('Plan not found');
    }

    const entity: Partial<OrganizationEntity> = {
      name: dto.name,
      acronym: dto.acronym,
      email_domain: dto.email_domain,
      contact_name: dto.contact_name,
      contact_email: dto.contact_email,
      created_by: user.id,
      status: 'active',
      plan: plan,
    };

    const organization = this.organizationRepository.create(entity);

    return organization;
  }
}
