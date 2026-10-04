import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PaymentEntity,
  PaymentStatus,
} from 'src/infrastructure/database/schema/payment.entity';

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

  async findByOrganizationId(
    organizationId: string,
    limit = 50,
    offset = 0,
  ): Promise<PaymentEntity[]> {
    return this.paymentRepository.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['plan'],
    });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    additionalData?: Partial<PaymentEntity>,
  ): Promise<PaymentEntity | null> {
    const updateData: Partial<PaymentEntity> = { status, ...additionalData };

    if (status === PaymentStatus.SUCCEEDED) {
      updateData.paid_at = new Date();
    } else if (status === PaymentStatus.FAILED) {
      updateData.failed_at = new Date();
    }

    await this.paymentRepository.update(id, updateData);
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
