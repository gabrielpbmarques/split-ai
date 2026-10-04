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

import { SessionEntity } from 'src/infrastructure/database/schema/session.entity';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  session_id!: string;

  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  agent_id!: string | null;

  @Column({ type: 'text', nullable: false })
  message!: string;

  @ManyToOne(() => SessionEntity, (session) => session.messages)
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity;

  @Column({ type: 'enum', enum: ['user', 'agent'], nullable: false })
  from!: 'user' | 'agent';

  @Column({ type: 'jsonb', nullable: true })
  embedding?: number[] | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;
}
