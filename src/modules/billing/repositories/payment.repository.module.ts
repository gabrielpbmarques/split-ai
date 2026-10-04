import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentEntity } from 'src/infrastructure/database/schema';
import { PaymentRepository } from 'src/modules/billing/repositories/payment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  providers: [PaymentRepository],
  exports: [PaymentRepository],
})
export class PaymentRepositoryModule {}
