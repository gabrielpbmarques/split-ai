import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MessageEntity } from 'src/infrastructure/database/schema/message.entity';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: true })
  user_id!: string;

  @Column({ type: 'text', nullable: false })
  agent_id!: string;

  @OneToMany(() => MessageEntity, (message) => message.session)
  messages!: MessageEntity[];

  @Column({ type: 'timestamp', nullable: false })
  expires_at!: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  expired!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;
}
