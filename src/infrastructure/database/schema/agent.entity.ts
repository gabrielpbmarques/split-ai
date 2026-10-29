import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from 'src/infrastructure/database/schema/user.entity';
import type { ResponseFormat } from 'src/shared/contracts';

@Entity('agents')
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: false, unique: true })
  agent_identifier!: string;

  @Column({ type: 'text', nullable: true })
  model!: string | null;

  @Column({ type: 'float', nullable: true, default: 0.4 })
  temperature!: number | null;

  @Column({ type: 'boolean', nullable: false, default: true })
  with_history!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  response_format!: ResponseFormat | null;

  @Column({ type: 'text', nullable: false, default: '' })
  system_prompt!: string;

  @Column('text', { array: true, default: '{}' })
  tools!: string[];

  @Column('text', { array: true, nullable: true })
  sites!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  canvas_layout!: Record<string, unknown> | null;

  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @ManyToOne(() => UserEntity, (user) => user.agents)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;
}
