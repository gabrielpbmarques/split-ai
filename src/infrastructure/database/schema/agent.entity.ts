import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AgentInstructionEntity } from 'src/infrastructure/database/schema/agent-instruction.entity';
import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';
import { UserEntity } from 'src/infrastructure/database/schema/user.entity';

@Entity('agents')
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true, unique: false })
  agent_identifier: string | null;

  @Column({ type: 'text', nullable: true })
  model: string | null;

  @Column({ type: 'float', nullable: true, default: 0.4 })
  temperature: number | null;

  @Column({ type: 'boolean', nullable: false, default: true })
  with_history: boolean;

  @Column({ type: 'jsonb', nullable: true })
  parser_schema: any | null;

  @Column({ type: 'text', nullable: true })
  parser_name: string | null;

  @Column({ type: 'text', nullable: true })
  parser_description: string | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  vector_search_tool: boolean | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  database_tool: boolean | null;

  @Column('text', { array: true, nullable: true })
  sites: string[] | null;

  // Persisted state of this agent's Agent-Connections canvas (when it is the
  // principal): viewport (zoom/pan) plus node positions keyed by agent id.
  // Purely presentational — the logical links live in `agent_connections`.
  @Column({ type: 'jsonb', nullable: true })
  canvas_layout: any | null;

  @OneToMany(() => AgentInstructionEntity, (instruction) => instruction.agent)
  instructions: AgentInstructionEntity[];

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @ManyToOne(() => UserEntity, (user) => user.agents)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string | null;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.agents)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
