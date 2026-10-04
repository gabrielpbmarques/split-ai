import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';
import { PlanEntity } from 'src/infrastructure/database/schema/plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
}

@Entity('subscriptions')
@Index('subscriptions_stripe_subscription_id_uq', ['stripe_subscription_id'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organization_id!: string;

  @Column({ type: 'uuid' })
  plan_id!: string;

  @Column({ type: 'text' })
  stripe_subscription_id!: string;

  @Column({ type: 'text', nullable: true })
  stripe_customer_id!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'int' })
  credits_per_period!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_per_period!: number;

  @Column({ type: 'timestamp', nullable: true })
  current_period_start!: Date;

  @Column({ type: 'timestamp', nullable: true })
  current_period_end!: Date;

  @Column({ type: 'timestamp', nullable: true })
  canceled_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  trial_start!: Date;

  @Column({ type: 'timestamp', nullable: true })
  trial_end!: Date;

  @Column({ type: 'boolean', default: true })
  auto_renew!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'plan_id' })
  plan!: PlanEntity;
}
