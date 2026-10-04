import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { Executor } from 'src/infrastructure/database/database.types';
import { CreditBalanceEntity } from 'src/infrastructure/database/schema/credit-balance.entity';

@Injectable()
export class CreditBalanceRepository {
  constructor(
    @InjectRepository(CreditBalanceEntity)
    private creditBalanceRepository: Repository<CreditBalanceEntity>,
  ) {}

  async findByOrganizationId(
    organizationId: string,
    tx?: Executor,
  ): Promise<CreditBalanceEntity | null> {
    return this.repo(tx).findOne({
      where: { organization_id: organizationId },
      relations: ['organization'],
    });
  }

  async create(
    data: Partial<CreditBalanceEntity>,
    tx?: Executor,
  ): Promise<CreditBalanceEntity> {
    const repo = this.repo(tx);
    return repo.save(repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CreditBalanceEntity>,
  ): Promise<CreditBalanceEntity | null> {
    await this.creditBalanceRepository.update(
      id,
      data as QueryDeepPartialEntity<CreditBalanceEntity>,
    );
    return this.creditBalanceRepository.findOne({ where: { id } });
  }

  async addCredits(
    organizationId: string,
    credits: number,
    tx?: Executor,
  ): Promise<CreditBalanceEntity | null> {
    const balance = await this.findByOrganizationId(organizationId, tx);
    if (!balance) {
      return this.create(
        {
          organization_id: organizationId,
          total_credits: credits,
          available_credits: credits,
          used_credits: 0,
          reserved_credits: 0,
          last_purchase_at: new Date(),
        },
        tx,
      );
    }

    balance.total_credits += credits;
    balance.available_credits += credits;
    balance.last_purchase_at = new Date();
    return this.repo(tx).save(balance);
  }

  async consumeCredits(
    organizationId: string,
    credits: number,
    tx?: Executor,
  ): Promise<CreditBalanceEntity | null> {
    const balance = await this.findByOrganizationId(organizationId, tx);
    if (!balance || balance.available_credits < credits) {
      return null;
    }

    balance.used_credits += credits;
    balance.available_credits -= credits;
    balance.last_consumption_at = new Date();
    return this.repo(tx).save(balance);
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

  private repo(tx?: Executor): Repository<CreditBalanceEntity> {
    return tx
      ? tx.getRepository(CreditBalanceEntity)
      : this.creditBalanceRepository;
  }
}
