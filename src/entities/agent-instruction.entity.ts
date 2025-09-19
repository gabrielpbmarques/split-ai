import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AgentEntity } from './agent.entity';

@Entity('agents_instructions')
export class AgentInstructionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  agent_id: string;

  @ManyToOne(() => AgentEntity, (agent) => agent.instructions)
  @JoinColumn({ name: 'agent_id' })
  agent: AgentEntity;

  @Column({ type: 'jsonb', nullable: false })
  instructions: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
