import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { TransactionType } from 'src/infrastructure/database/schema/credit-transaction.entity';
import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';
import { PlanType } from 'src/infrastructure/database/schema/plan.entity';
import { ManageCreditsService } from 'src/modules/billing/manage-credits/manage-credits.service';
import { PlanRepository } from 'src/modules/billing/repositories/plan.repository';
import { CreateOrganizationDto } from 'src/modules/organizations/create-organization/create-organization.dto';
import { OrganizationRepository } from 'src/modules/organizations/repositories/organization.repository';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class CreateOrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly planRepository: PlanRepository,
    private readonly manageCreditsService: ManageCreditsService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: CreateOrganizationDto, user: AuthenticatedUser) {
    let plan;

    if (dto.planId) {
      plan = await this.planRepository.findById(dto.planId);
    } else {
      const planType = dto.plan || PlanType.FREE;
      plan = await this.planRepository.findByType(planType);
    }

    if (!plan) {
      throw new BadRequestException('Plano não encontrado');
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

    const organization = await this.organizationRepository.create(entity);

    // Self-serve flow: the creator becomes the organization owner when they do
    // not already belong to one. Platform admins acting on behalf of others
    // (already linked to an organization) are left untouched.
    if (user.id && !user.organization_id) {
      await this.userRepository.update(user.id, {
        organization_id: organization.id,
        org_role: 'owner',
      });
    }

    // Grant the plan's initial credits (e.g. the free tier allowance) so the
    // organization can start using the product immediately.
    if (plan.monthly_credits && plan.monthly_credits > 0) {
      await this.manageCreditsService.execute(
        organization.id,
        plan.monthly_credits,
        TransactionType.BONUS,
        'Créditos iniciais do plano',
        { planType: plan.type, planId: plan.id },
      );
    }

    return organization;
  }
}
