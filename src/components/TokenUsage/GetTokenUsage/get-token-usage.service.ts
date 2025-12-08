import { Injectable } from '@nestjs/common';
import { TokenUsageRepository } from 'src/repositories';

import { GetTokenUsageDto } from './get-token-usage.dto';

@Injectable()
export class GetTokenUsageService {
  constructor(private readonly tokenUsageRepository: TokenUsageRepository) {}

  async execute(dto: GetTokenUsageDto, userOrganizationId?: string) {
    const startDate = dto.start_date
      ? new Date(dto.start_date)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = dto.end_date ? new Date(dto.end_date) : new Date();

    const filters = {
      organization_id: dto.organization_id || userOrganizationId,
      start_date: startDate,
      end_date: endDate,
    };

    const [totals, daily, byAgent] = await Promise.all([
      this.tokenUsageRepository.getTotals(filters),
      this.tokenUsageRepository.getDailyUsage(filters),
      this.tokenUsageRepository.getUsageByAgent(filters),
    ]);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      totals,
      daily_usage: daily,
      usage_by_agent: byAgent,
    };
  }
}
