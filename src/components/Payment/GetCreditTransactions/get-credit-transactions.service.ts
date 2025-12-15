import { Injectable, BadRequestException } from '@nestjs/common';
import { CreditTransactionRepository } from 'src/repositories/credit-transaction.repository';

@Injectable()
export class GetCreditTransactionsService {
  constructor(
    private readonly creditTransactionRepository: CreditTransactionRepository,
  ) {}

  async execute(organizationId: string, limit = 100, offset = 0) {
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
