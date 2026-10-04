import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';

@Entity('credit_balances')
@Index('credit_balances_organization_id_uq', ['organization_id'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class CreditBalanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
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

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @OneToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
