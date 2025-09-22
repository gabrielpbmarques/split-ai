import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
  })
  recipient_role: 'user' | 'admin';

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @Column({ type: 'uuid', nullable: true })
  entity_id: string | null;

  @Column({ type: 'enum', enum: ['Alert', 'General'], default: 'General' })
  entity_type: 'Alert' | 'General';

  @Column({
    type: 'enum',
    enum: ['sent', 'failed', 'delivered'],
    default: 'sent',
  })
  status: 'sent' | 'failed' | 'delivered';

  @Column({ type: 'text', default: 'expo' })
  push_provider: string;

  @Column({ type: 'text', nullable: true })
  provider_message_id: string | null;

  @Column({ type: 'text', nullable: true })
  error_code: string | null;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date | null;
}
