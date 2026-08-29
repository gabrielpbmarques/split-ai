import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities';

import { NotificationRepository } from './notification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  providers: [NotificationRepository],
  exports: [NotificationRepository],
})
export class NotificationRepositoryModule {}
