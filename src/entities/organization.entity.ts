import { Organization, OrganizationPlan, OrganizationStatus } from 'src/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('organizations')
export class OrganizationEntity implements Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  acronym: string;

  @Column({ type: 'text' })
  email_domain: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: OrganizationStatus;

  @Column({ type: 'text', nullable: true })
  contact_name: string;

  @Column({ type: 'text', nullable: true })
  contact_email: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({
    type: 'timestamp',
    name: 'activated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  activated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deactivated_at: Date;

  @Column({
    type: 'enum',
    enum: ['manual', 'free', 'monthly'],
    default: 'manual',
  })
  plan: OrganizationPlan;
}
