import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import {
  CreditTransactionEntity,
  TransactionType,
} from '../entities/credit-transaction.entity';

@Injectable()
export class CreditTransactionRepository {
  constructor(
    @InjectRepository(CreditTransactionEntity)
    private creditTransactionRepository: Repository<CreditTransactionEntity>,
  ) {}

  async create(
    data: Partial<CreditTransactionEntity>,
  ): Promise<CreditTransactionEntity> {
    const transaction = this.creditTransactionRepository.create(data);
    return this.creditTransactionRepository.save(transaction);
  }

  async findById(id: string): Promise<CreditTransactionEntity | null> {
    return this.creditTransactionRepository.findOne({
      where: { id },
      relations: ['organization', 'user', 'plan'],
    });
  }

  async findByOrganizationId(
    organizationId: string,
    limit = 100,
    offset = 0,
  ): Promise<CreditTransactionEntity[]> {
    return this.creditTransactionRepository.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user', 'plan'],
    });
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
}
