import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { AgentEntity } from './agent.entity';
import { OrganizationEntity } from './organization.entity';

/**
 * Links a principal agent to a child agent that the principal can call as a
 * tool (agent-as-tool orchestration). Scoped to one organization; both the
 * principal and the child must belong to that organization. Connected children
 * are wired into the principal's toolset at runtime by
 * `ResolveAgentService.loadTools`.
 */
@Entity('agent_connections')
@Unique(['principal_agent_id', 'child_agent_id'])
@Check('"principal_agent_id" <> "child_agent_id"')
export class AgentConnectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'uuid' })
  principal_agent_id: string;

  @Column({ type: 'uuid' })
  child_agent_id: string;

  // Name the principal agent's LLM sees for this tool. Must be a safe
  // identifier (letters, numbers, hyphen, underscore) for the model provider.
  @Column({ type: 'text' })
  tool_name: string;

  // Tells the principal's LLM when to delegate to the connected child agent.
  @Column({ type: 'text' })
  tool_description: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  // Ordering hint for the visual canvas and the principal's tool list.
  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => AgentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'principal_agent_id' })
  principalAgent: AgentEntity;

  @ManyToOne(() => AgentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_agent_id' })
  childAgent: AgentEntity;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
