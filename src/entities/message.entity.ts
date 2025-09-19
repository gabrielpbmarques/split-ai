import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SessionEntity } from './session.entity';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  session_id: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @ManyToOne(() => SessionEntity, (session) => session.messages)
  @JoinColumn({ name: 'session_id' })
  session: SessionEntity;

  @Column({ type: 'enum', enum: ['user', 'agent'], nullable: false })
  from: 'user' | 'agent';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
