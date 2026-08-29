import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsVerificationEntity } from 'src/entities';

import { SmsVerificationRepository } from './sms-verification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SmsVerificationEntity])],
  providers: [SmsVerificationRepository],
  exports: [SmsVerificationRepository],
})
export class SmsVerificationRepositoryModule {}
