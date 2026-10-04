import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import type { Executor } from 'src/infrastructure/database/database.types';
import {
  CreditTransactionEntity,
  TransactionType,
} from 'src/infrastructure/database/schema/credit-transaction.entity';
import {
  type PageRequest,
  type PageResult,
  skipOf,
} from 'src/shared/contracts/pagination';

@Injectable()
export class CreditTransactionRepository {
  constructor(
    @InjectRepository(CreditTransactionEntity)
    private creditTransactionRepository: Repository<CreditTransactionEntity>,
  ) {}

  async create(
    data: Partial<CreditTransactionEntity>,
    tx?: Executor,
  ): Promise<CreditTransactionEntity> {
    const repo = tx
      ? tx.getRepository(CreditTransactionEntity)
      : this.creditTransactionRepository;
    return repo.save(repo.create(data));
  }

  async findById(id: string): Promise<CreditTransactionEntity | null> {
    return this.creditTransactionRepository.findOne({
      where: { id },
      relations: ['organization', 'user', 'plan'],
    });
  }

  async listByOrganizationPaginated(
    organizationId: string,
    page: PageRequest,
  ): Promise<PageResult<CreditTransactionEntity>> {
    const [items, total] = await this.creditTransactionRepository.findAndCount({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
      skip: skipOf(page),
      take: page.limit,
      relations: ['user', 'plan'],
    });

    return { items, total };
  }

  async findByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CreditTransactionEntity[]> {
    return this.creditTransactionRepository.find({
      where: {
        organization_id: organizationId,
        created_at: Between(startDate, endDate),
      },
      order: { created_at: 'DESC' },
      relations: ['user', 'plan'],
    });
  }

  async getTotalConsumedCredits(
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const query = this.creditTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(ABS(transaction.amount))', 'total')
      .where('transaction.organization_id = :organizationId', {
        organizationId,
      })
      .andWhere('transaction.type = :type', {
        type: TransactionType.CONSUMPTION,
      })
      .andWhere('transaction.status = :status', { status: 'completed' });

    if (startDate && endDate) {
      query.andWhere('transaction.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const result = await query.getRawOne();
    return parseInt(result?.total || '0', 10);
  }

  async getTotalPurchasedCredits(
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const query = this.creditTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.organization_id = :organizationId', {
        organizationId,
      })
      .andWhere('transaction.type = :type', { type: TransactionType.PURCHASE })
      .andWhere('transaction.status = :status', { status: 'completed' });

    if (startDate && endDate) {
      query.andWhere('transaction.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const result = await query.getRawOne();
    return parseInt(result?.total || '0', 10);
  }

  async getSessionConsumption(sessionId: string): Promise<number> {
    const query = this.creditTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(ABS(transaction.amount))', 'total')
      .where('transaction.session_id = :sessionId', { sessionId })
      .andWhere('transaction.type = :type', {
        type: TransactionType.CONSUMPTION,
      });

    const result = await query.getRawOne();
    return parseInt(result?.total || '0', 10);
  }
}
