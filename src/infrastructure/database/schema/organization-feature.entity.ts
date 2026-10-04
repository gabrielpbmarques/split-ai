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

import { FeatureEntity } from 'src/infrastructure/database/schema/feature.entity';
import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';

@Entity('organization_features')
@Index(
  'organization_features_org_feature_uq',
  ['organization_id', 'feature_id'],
  {
    unique: true,
    where: '"deleted_at" IS NULL',
  },
)
export class OrganizationFeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organization_id!: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column({ type: 'uuid', nullable: false })
  feature_id!: string;

  @ManyToOne(() => FeatureEntity)
  @JoinColumn({ name: 'feature_id' })
  feature!: FeatureEntity;

  @Column({ type: 'boolean', default: false, nullable: false })
  enabled!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config!: Record<string, unknown> | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;
}
