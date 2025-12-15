import { Injectable, BadRequestException } from '@nestjs/common';
import { CreditBalanceRepository } from 'src/repositories/credit-balance.repository';

@Injectable()
export class GetCreditsService {
  constructor(
    private readonly creditBalanceRepository: CreditBalanceRepository,
  ) {}

  async execute(organizationId: string) {
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
