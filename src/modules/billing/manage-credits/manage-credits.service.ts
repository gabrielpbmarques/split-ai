import { Injectable, BadRequestException } from '@nestjs/common';

import type { Executor } from 'src/infrastructure/database/database.types';
import {
  type CreditTransactionEntity,
  TransactionType,
  TransactionStatus,
} from 'src/infrastructure/database/schema/credit-transaction.entity';
import { CreditBalanceRepository } from 'src/modules/billing/repositories/credit-balance.repository';
import { CreditTransactionRepository } from 'src/modules/billing/repositories/credit-transaction.repository';

@Injectable()
export class ManageCreditsService {
  constructor(
    private readonly creditBalanceRepository: CreditBalanceRepository,
    private readonly creditTransactionRepository: CreditTransactionRepository,
  ) {}

  async execute(
    organizationId: string,
    credits: number,
    type: TransactionType,
    description?: string,
    metadata?: Record<string, unknown>,
    tx?: Executor,
  ): Promise<CreditTransactionEntity> {
    let balance = await this.creditBalanceRepository.findByOrganizationId(
      organizationId,
      tx,
    );

    if (!balance) {
      balance = await this.creditBalanceRepository.create(
        {
          organization_id: organizationId,
          total_credits: 0,
          used_credits: 0,
          available_credits: 0,
          reserved_credits: 0,
        },
        tx,
      );
    }

    const balanceBefore = balance.available_credits;
    let balanceAfter = balanceBefore;
    let amount = credits;

    switch (type) {
      case TransactionType.PURCHASE:
      case TransactionType.BONUS:
      case TransactionType.REFUND:
        balanceAfter = balanceBefore + credits;
        break;

      case TransactionType.CONSUMPTION:
        if (balanceBefore < credits) {
          throw new BadRequestException('Insufficient credits');
        }
        balanceAfter = balanceBefore - credits;
        amount = -credits;
        break;

      case TransactionType.ADJUSTMENT:
        balanceAfter = balanceBefore + credits;
        break;
    }

    const transaction = await this.creditTransactionRepository.create(
      {
        organization_id: organizationId,
        type,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        metadata,
        status: TransactionStatus.COMPLETED,
      },
      tx,
    );

    if (type === TransactionType.CONSUMPTION) {
      await this.creditBalanceRepository.consumeCredits(
        organizationId,
        credits,
        tx,
      );
    } else if (
      type === TransactionType.PURCHASE ||
      type === TransactionType.BONUS ||
      type === TransactionType.REFUND
    ) {
      await this.creditBalanceRepository.addCredits(
        organizationId,
        credits,
        tx,
      );
    }

    return transaction;
  }
}
