import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SmsVerificationEntity } from 'src/infrastructure/database/schema';
import { SmsVerificationRepository } from 'src/modules/auth-flows/repositories/sms-verification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SmsVerificationEntity])],
  providers: [SmsVerificationRepository],
  exports: [SmsVerificationRepository],
})
export class SmsVerificationRepositoryModule {}
