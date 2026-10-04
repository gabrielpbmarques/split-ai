import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { Executor } from 'src/infrastructure/database/database.types';
import {
  PaymentEntity,
  PaymentStatus,
} from 'src/infrastructure/database/schema/payment.entity';
import {
  type PageRequest,
  type PageResult,
  skipOf,
} from 'src/shared/contracts/pagination';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}

  async create(data: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const payment = this.paymentRepository.create(data);
    return this.paymentRepository.save(payment);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    return this.paymentRepository.findOne({
      where: { id },
      relations: ['organization', 'plan'],
    });
  }

  async findByStripePaymentIntentId(
    paymentIntentId: string,
  ): Promise<PaymentEntity | null> {
    return this.paymentRepository.findOne({
      where: { stripe_payment_intent_id: paymentIntentId },
      relations: ['organization', 'plan'],
    });
  }

  async listByOrganizationPaginated(
    organizationId: string,
    page: PageRequest,
  ): Promise<PageResult<PaymentEntity>> {
    const [items, total] = await this.paymentRepository.findAndCount({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
      skip: skipOf(page),
      take: page.limit,
      relations: ['plan'],
    });

    return { items, total };
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    additionalData?: Partial<PaymentEntity>,
    tx?: Executor,
  ): Promise<PaymentEntity | null> {
    const updateData: Partial<PaymentEntity> = { status, ...additionalData };

    if (status === PaymentStatus.SUCCEEDED) {
      updateData.paid_at = new Date();
    } else if (status === PaymentStatus.FAILED) {
      updateData.failed_at = new Date();
    }

    await (
      tx ? tx.getRepository(PaymentEntity) : this.paymentRepository
    ).update(id, updateData as QueryDeepPartialEntity<PaymentEntity>);
    return this.findById(id);
  }

  async getTotalRevenue(organizationId?: string): Promise<number> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SUCCEEDED });

    if (organizationId) {
      query.andWhere('payment.organization_id = :organizationId', {
        organizationId,
      });
    }

    const result = await query.getRawOne();
    return parseFloat(result?.total || '0');
  }
}
