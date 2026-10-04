import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PlanType {
  FREE = 'free',
  PAYG = 'payg',
  STARTER = 'starter',
  GROWTH = 'growth',
  SCALE = 'scale',
  ENTERPRISE = 'enterprise',
}

export enum BillingPeriod {
  ONCE = 'once',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PlanType,
    unique: true,
  })
  type: PlanType;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  credits: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  price_per_credit: number;

  @Column({
    type: 'enum',
    enum: BillingPeriod,
    default: BillingPeriod.ONCE,
  })
  billing_period: BillingPeriod;

  @Column({ type: 'text', nullable: true })
  stripe_price_id: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Whitelabel plan benefits / limits.
  // `null` means unbounded for the numeric limits.
  @Column({ type: 'int', nullable: true })
  max_agents: number | null;

  @Column({ type: 'int', nullable: true })
  max_users: number | null;

  // When true, the plan bypasses credit billing and all quotas (e.g. MAIA playground).
  @Column({ type: 'boolean', default: false })
  unlimited: boolean;

  // Credits granted to the organization when it enters this plan (e.g. free tier).
  @Column({ type: 'int', nullable: true })
  monthly_credits: number | null;

  @Column({ type: 'int', nullable: true })
  min_conversations: number;

  @Column({ type: 'int', nullable: true })
  max_conversations: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
