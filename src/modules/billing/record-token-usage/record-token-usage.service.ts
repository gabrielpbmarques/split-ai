import { Injectable, Logger } from '@nestjs/common';

import { RecordTokenUsageDto } from 'src/modules/billing/record-token-usage/record-token-usage.dto';
import { TokenUsageRepository } from 'src/modules/billing/repositories/token-usage.repository';

@Injectable()
export class RecordTokenUsageService {
  private readonly logger = new Logger(RecordTokenUsageService.name);

  constructor(private readonly tokenUsageRepository: TokenUsageRepository) {}

  async execute(params: RecordTokenUsageDto): Promise<void> {
    try {
      await this.tokenUsageRepository.create({
        ...params,
        input_tokens: params.input_tokens || 0,
        output_tokens: params.output_tokens || 0,
        total_tokens: params.total_tokens || 0,
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to record token usage for organization ${params.organization_id}: ${error.message}`,
        error.stack,
      );
    }
  }
}
