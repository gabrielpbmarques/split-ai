import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories';

@Injectable()
export class ListOrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(filters?: {
    name?: string;
    acronym?: string;
    email_domain?: string;
    contact_name?: string;
    contact_email?: string;
    status?: string;
    plan?: string;
    activated_at?: string;
  }) {
    if (filters && Object.keys(filters).some((key) => filters[key])) {
      return this.organizationRepository.findWithFilters(filters);
    }
    return this.organizationRepository.findAll();
  }
}
