import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories';
import { Organization, User } from 'src/types';

import { CreateOrganizationDto } from './create-organization.dto';

@Injectable()
export class CreateOrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(dto: CreateOrganizationDto, user: User) {
    const entity: Organization = {
      name: dto.name,
      acronym: dto.acronym,
      email_domain: dto.email_domain,
      contact_name: dto.contact_name,
      contact_email: dto.contact_email,
      created_by: user.id,
      status: 'active',
    };

    const organization = this.organizationRepository.create(entity);

    return organization;
  }
}
