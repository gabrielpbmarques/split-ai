import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AgentInstructionEntity } from './agent-instruction.entity';

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

  @OneToMany(() => AgentInstructionEntity, (instruction) => instruction.agent)
  instructions: AgentInstructionEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
