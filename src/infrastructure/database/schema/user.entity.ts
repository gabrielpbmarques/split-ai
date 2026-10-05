import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AgentEntity } from 'src/infrastructure/database/schema/agent.entity';
import { UserOrigin, UserRole, UserStatus } from 'src/shared/contracts';

@Entity('users')
@Index('users_email_uq', ['email'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'guest'],
    default: 'user',
  })
  role!: UserRole;

  @Column({ type: 'text', nullable: true })
  phone!: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status!: UserStatus;

  @OneToMany(() => AgentEntity, (agent) => agent.user)
  agents!: AgentEntity[];

  @Column({
    type: 'enum',
    enum: ['whatsapp', 'website', 'app'],
    default: 'website',
  })
  origin!: UserOrigin;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;
}
