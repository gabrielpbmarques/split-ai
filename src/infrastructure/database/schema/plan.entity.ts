import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
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
@Index('plans_type_uq', ['type'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: PlanType,
  })
  type!: PlanType;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'int' })
  credits!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  price_per_credit!: number;

  @Column({
    type: 'enum',
    enum: BillingPeriod,
    default: BillingPeriod.ONCE,
  })
  billing_period!: BillingPeriod;

  @Column({ type: 'text', nullable: true })
  stripe_price_id!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'int', nullable: true })
  max_agents!: number | null;

  @Column({ type: 'int', nullable: true })
  max_users!: number | null;

  @Column({ type: 'boolean', default: false })
  unlimited!: boolean;

  @Column({ type: 'int', nullable: true })
  monthly_credits!: number | null;

  @Column({ type: 'int', nullable: true })
  min_conversations!: number;

  @Column({ type: 'int', nullable: true })
  max_conversations!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;
}
