import { Injectable, Logger } from '@nestjs/common';
import { TokenUsageRepository } from 'src/repositories';

import { RecordTokenUsageDto } from './record-token-usage.dto';

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
    } catch (error) {
      this.logger.error(
        `Failed to record token usage for organization ${params.organization_id}: ${error.message}`,
        error.stack,
      );
    }
  }
}
