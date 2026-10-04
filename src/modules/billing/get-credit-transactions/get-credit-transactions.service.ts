import { BadRequestException, Injectable } from '@nestjs/common';

import type { CreditTransactionEntity } from 'src/infrastructure/database/schema';
import type { GetCreditTransactionsQueryDto } from 'src/modules/billing/get-credit-transactions/get-credit-transactions.dto';
import { CreditTransactionRepository } from 'src/modules/billing/repositories/credit-transaction.repository';
import {
  type PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

@Injectable()
export class GetCreditTransactionsService {
  constructor(
    private readonly creditTransactionRepository: CreditTransactionRepository,
  ) {}

  async execute(
    organizationId: string,
    dto: GetCreditTransactionsQueryDto,
  ): Promise<PaginatedResponse<CreditTransactionEntity>> {
    if (!organizationId) {
      throw new BadRequestException('Organização não encontrada');
    }

    const page =
      await this.creditTransactionRepository.listByOrganizationPaginated(
        organizationId,
        dto,
      );
    return toPaginatedResponse(page, dto);
  }
}
