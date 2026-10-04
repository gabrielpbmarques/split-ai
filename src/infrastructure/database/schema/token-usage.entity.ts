import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AgentEntity } from 'src/infrastructure/database/schema/agent.entity';
import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';
import { UserEntity } from 'src/infrastructure/database/schema/user.entity';

@Entity('token_usage')
export class TokenUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organization_id!: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column({ type: 'uuid', nullable: true })
  agent_id!: string | null;

  @ManyToOne(() => AgentEntity)
  @JoinColumn({ name: 'agent_id' })
  agent!: AgentEntity;

  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'int', nullable: false, default: 0 })
  input_tokens!: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  output_tokens!: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  total_tokens!: number;

  @Column({ type: 'text', nullable: true })
  model!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
