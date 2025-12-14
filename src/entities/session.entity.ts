import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MessageEntity } from './message.entity';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  user_id: string;

  @Column({ type: 'text', nullable: false })
  agent_id: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string | null;

  @OneToMany(() => MessageEntity, (message) => message.session)
  messages: MessageEntity[];

  @Column({ type: 'timestamp', nullable: false })
  expires_at: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  expired: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
