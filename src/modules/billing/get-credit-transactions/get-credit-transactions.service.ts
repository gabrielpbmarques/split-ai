import { Injectable, BadRequestException } from '@nestjs/common';

import { CreditTransactionEntity } from 'src/infrastructure/database/schema';
import { CreditTransactionRepository } from 'src/modules/billing/repositories/credit-transaction.repository';

@Injectable()
export class GetCreditTransactionsService {
  constructor(
    private readonly creditTransactionRepository: CreditTransactionRepository,
  ) {}

  async execute(
    organizationId: string,
    limit = 100,
    offset = 0,
  ): Promise<CreditTransactionEntity[]> {
    if (!organizationId) {
      throw new BadRequestException('Organization not found');
    }

    return this.creditTransactionRepository.findByOrganizationId(
      organizationId,
      limit,
      offset,
    );
  }
}
