import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionEntity } from 'src/entities';

import { SubscriptionRepository } from './subscription.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionEntity])],
  providers: [SubscriptionRepository],
  exports: [SubscriptionRepository],
})
export class SubscriptionRepositoryModule {}
