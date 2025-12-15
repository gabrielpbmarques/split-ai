import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrganizationEntity } from './organization.entity';

@Entity('credit_balances')
export class CreditBalanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  organization_id: string;

  @Column({ type: 'int', default: 0 })
  total_credits: number;

  @Column({ type: 'int', default: 0 })
  used_credits: number;

  @Column({ type: 'int', default: 0 })
  available_credits: number;

  @Column({ type: 'int', default: 0 })
  reserved_credits: number;

  @Column({ type: 'timestamp', nullable: true })
  last_consumption_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_purchase_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
