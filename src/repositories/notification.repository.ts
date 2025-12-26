import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationEntity } from '../entities/notification.entity';

export type NotificationStatus = 'sent' | 'failed' | 'delivered';
export type NotificationEntityType = 'Alert' | 'General';
export type RecipientRole = 'user' | 'admin' | 'guest';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async create(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
    const notif = this.notificationRepository.create(data);
    return this.notificationRepository.save(notif);
  }

  async findByUser(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({ where: { user_id: userId } });
  }

  async findByEntity(
    entity_type: NotificationEntityType,
    entity_id: string,
  ): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      where: { entity_type, entity_id },
    });
  }

  async updateStatus(
    id: string,
    status: NotificationStatus,
    delivered_at?: Date,
    error?: { code?: string; message?: string },
  ): Promise<NotificationEntity | null> {
    await this.notificationRepository.update(id, {
      status,
      delivered_at: delivered_at ?? null,
      error_code: error?.code ?? null,
      error_message: error?.message ?? null,
    });
    return this.notificationRepository.findOne({ where: { id } });
  }
}
