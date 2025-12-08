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

export type SourceType = 'pdf' | 'site';
export type SourceStatus = 'processing' | 'completed' | 'failed';

@Entity('sources')
export class SourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agent_id: string;

  @ManyToOne(() => AgentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: AgentEntity;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  source_type: SourceType;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column({ type: 'text', nullable: true })
  file_name: string | null;

  @Column({ type: 'int', default: 0 })
  chunk_count: number;

  @Column({ type: 'text', default: 'processing' })
  status: SourceStatus;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
