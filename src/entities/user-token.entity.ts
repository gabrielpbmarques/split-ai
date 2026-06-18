import type { UserRole, UserStatus } from 'src/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_tokens')
export class UserTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'guest'],
    default: 'user',
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status: UserStatus;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
