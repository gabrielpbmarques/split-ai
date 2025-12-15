import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreditBalanceEntity } from '../entities/credit-balance.entity';

@Injectable()
export class CreditBalanceRepository {
  constructor(
    @InjectRepository(CreditBalanceEntity)
    private creditBalanceRepository: Repository<CreditBalanceEntity>,
  ) {}

  async findByOrganizationId(
    organizationId: string,
  ): Promise<CreditBalanceEntity | null> {
    return this.creditBalanceRepository.findOne({
      where: { organization_id: organizationId },
      relations: ['organization'],
    });
  }

  async create(
    data: Partial<CreditBalanceEntity>,
  ): Promise<CreditBalanceEntity> {
    const balance = this.creditBalanceRepository.create(data);
    return this.creditBalanceRepository.save(balance);
  }

  async update(
    id: string,
    data: Partial<CreditBalanceEntity>,
  ): Promise<CreditBalanceEntity | null> {
    await this.creditBalanceRepository.update(id, data);
    return this.creditBalanceRepository.findOne({ where: { id } });
  }

  async addCredits(
    organizationId: string,
    credits: number,
  ): Promise<CreditBalanceEntity | null> {
    const balance = await this.findByOrganizationId(organizationId);
    if (!balance) {
      return this.create({
        organization_id: organizationId,
        total_credits: credits,
        available_credits: credits,
        used_credits: 0,
        reserved_credits: 0,
        last_purchase_at: new Date(),
      });
    }

    balance.total_credits += credits;
    balance.available_credits += credits;
    balance.last_purchase_at = new Date();
    return this.creditBalanceRepository.save(balance);
  }

  async consumeCredits(
    organizationId: string,
    credits: number,
  ): Promise<CreditBalanceEntity | null> {
    const balance = await this.findByOrganizationId(organizationId);
    if (!balance || balance.available_credits < credits) {
      return null;
    }

    balance.used_credits += credits;
    balance.available_credits -= credits;
    balance.last_consumption_at = new Date();
    return this.creditBalanceRepository.save(balance);
  }

  async hasEnoughCredits(
    organizationId: string,
    credits: number,
  ): Promise<boolean> {
    const balance = await this.findByOrganizationId(organizationId);
    return balance ? balance.available_credits >= credits : false;
  }

  async getAvailableCredits(organizationId: string): Promise<number> {
    const balance = await this.findByOrganizationId(organizationId);
    return balance ? balance.available_credits : 0;
  }
}
