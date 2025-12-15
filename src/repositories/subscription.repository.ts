import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  SubscriptionEntity,
  SubscriptionStatus,
} from '../entities/subscription.entity';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private subscriptionRepository: Repository<SubscriptionEntity>,
  ) {}

  async create(data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity> {
    const subscription = this.subscriptionRepository.create(data);
    return this.subscriptionRepository.save(subscription);
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findOne({
      where: { id },
      relations: ['organization', 'plan'],
    });
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findOne({
      where: { stripe_subscription_id: stripeSubscriptionId },
      relations: ['organization', 'plan'],
    });
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findOne({
      where: {
        organization_id: organizationId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });
  }

  async findAllByOrganizationId(
    organizationId: string,
  ): Promise<SubscriptionEntity[]> {
    return this.subscriptionRepository.find({
      where: { organization_id: organizationId },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    status: SubscriptionStatus,
    additionalData?: Partial<SubscriptionEntity>,
  ): Promise<SubscriptionEntity | null> {
    const updateData: Partial<SubscriptionEntity> = {
      status,
      ...additionalData,
    };

    if (status === SubscriptionStatus.CANCELED) {
      updateData.canceled_at = new Date();
    }

    await this.subscriptionRepository.update(id, updateData);
    return this.findById(id);
  }

  async getActiveSubscriptions(): Promise<SubscriptionEntity[]> {
    return this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
      relations: ['organization', 'plan'],
    });
  }

  async countActiveSubscriptions(): Promise<number> {
    return this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });
  }
}
