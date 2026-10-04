import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionEntity } from 'src/infrastructure/database/schema';
import { SubscriptionRepository } from 'src/modules/billing/repositories/subscription.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionEntity])],
  providers: [SubscriptionRepository],
  exports: [SubscriptionRepository],
})
export class SubscriptionRepositoryModule {}
