import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from 'src/entities';

import { PaymentRepository } from './payment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  providers: [PaymentRepository],
  exports: [PaymentRepository],
})
export class PaymentRepositoryModule {}
