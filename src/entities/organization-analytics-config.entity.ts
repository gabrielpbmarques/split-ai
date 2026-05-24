import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrganizationEntity } from './organization.entity';

@Entity('organization_analytics_config')
export class OrganizationAnalyticsConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  organization_id: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ type: 'text', nullable: false })
  sql_gateway_url: string;

  // TODO: encrypt this value at rest — kept as plain text for now.
  @Column({ type: 'text', nullable: true })
  sql_gateway_api_key: string | null;

  @Column({ type: 'text', nullable: false, default: 'company_id' })
  tenant_filter_column: string;

  @Column({ type: 'text', nullable: false })
  tenant_filter_value: string;

  @Column({ type: 'text', nullable: false, default: 'mysql-5.7' })
  database_dialect: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
