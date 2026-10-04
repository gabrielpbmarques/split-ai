import {
  Check,
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

import { AgentEntity } from 'src/infrastructure/database/schema/agent.entity';
import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';

@Entity('agent_connections')
@Index(
  'agent_connections_principal_child_uq',
  ['principal_agent_id', 'child_agent_id'],
  {
    unique: true,
    where: '"deleted_at" IS NULL',
  },
)
@Check('"principal_agent_id" <> "child_agent_id"')
export class AgentConnectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organization_id!: string;

  @Column({ type: 'uuid' })
  principal_agent_id!: string;

  @Column({ type: 'uuid' })
  child_agent_id!: string;

  @Column({ type: 'text' })
  tool_name!: string;

  @Column({ type: 'text' })
  tool_description!: string;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;
  @Column({ type: 'int', default: 0 })
  position!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;

  @ManyToOne(() => AgentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'principal_agent_id' })
  principalAgent!: AgentEntity;

  @ManyToOne(() => AgentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_agent_id' })
  childAgent!: AgentEntity;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;
}
