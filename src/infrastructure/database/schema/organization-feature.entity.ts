import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { FeatureEntity } from 'src/infrastructure/database/schema/feature.entity';
import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';

@Entity('organization_features')
@Unique('uq_organization_features_org_feature', [
  'organization_id',
  'feature_id',
])
export class OrganizationFeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  organization_id: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ type: 'uuid', nullable: false })
  feature_id: string;

  @ManyToOne(() => FeatureEntity)
  @JoinColumn({ name: 'feature_id' })
  feature: FeatureEntity;

  @Column({ type: 'boolean', default: false, nullable: false })
  enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
