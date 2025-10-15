import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories';

@Injectable()
export class ListOrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute() {
    return this.organizationRepository.findAll();
  }
}
