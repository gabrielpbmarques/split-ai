import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SmsVerificationEntity } from 'src/infrastructure/database/schema';

@Injectable()
export class SmsVerificationRepository {
  constructor(
    @InjectRepository(SmsVerificationEntity)
    private smsVerificationRepository: Repository<SmsVerificationEntity>,
  ) {}

  async findValidCode(
    phone: string,
    code: string,
  ): Promise<SmsVerificationEntity | null> {
    return this.smsVerificationRepository
      .createQueryBuilder('sms')
      .where('sms.phone = :phone', { phone })
      .andWhere('sms.code = :code', { code })
      .andWhere('sms.verified = :verified', { verified: false })
      .andWhere('sms.expires_at > :now', { now: new Date() })
      .getOne();
  }

  async upsert(
    data: Partial<SmsVerificationEntity>,
  ): Promise<SmsVerificationEntity> {
    const existing = await this.smsVerificationRepository.findOneBy({
      phone: data.phone,
    });

    if (existing) {
      await this.smsVerificationRepository.update(existing.id, data);
      return this.smsVerificationRepository.findOneBy({ id: existing.id });
    } else {
      const smsVerification = this.smsVerificationRepository.create(data);
      return this.smsVerificationRepository.save(smsVerification);
    }
  }

  async markAsVerified(id: string): Promise<void> {
    await this.smsVerificationRepository.update(id, { verified: true });
  }

  async create(
    data: Partial<SmsVerificationEntity>,
  ): Promise<SmsVerificationEntity> {
    const smsVerification = this.smsVerificationRepository.create(data);
    return this.smsVerificationRepository.save(smsVerification);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.smsVerificationRepository.softDelete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }
}
