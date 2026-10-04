import { Injectable, BadRequestException } from '@nestjs/common';

import { CreditBalanceRepository } from 'src/modules/billing/repositories/credit-balance.repository';

export interface CreditSummary {
  total_credits: number;
  used_credits: number;
  available_credits: number;
  reserved_credits: number;
}

@Injectable()
export class GetCreditsService {
  constructor(
    private readonly creditBalanceRepository: CreditBalanceRepository,
  ) {}

  async execute(organizationId: string): Promise<CreditSummary> {
    if (!organizationId) {
      throw new BadRequestException('Organization not found');
    }

    const balance =
      await this.creditBalanceRepository.findByOrganizationId(organizationId);

    return {
      total_credits: balance?.total_credits || 0,
      used_credits: balance?.used_credits || 0,
      available_credits: balance?.available_credits || 0,
      reserved_credits: balance?.reserved_credits || 0,
    };
  }
}
