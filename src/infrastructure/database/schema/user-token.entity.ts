import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole, UserStatus } from 'src/shared/contracts';

@Entity('user_tokens')
@Index('user_tokens_token_uq', ['token'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class UserTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'text' })
  token!: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'guest'],
    default: 'user',
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status!: UserStatus;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;
}
