import { UserRole, UserStatus } from 'src/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AgentEntity } from './agent.entity';
import { OrganizationEntity } from './organization.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', unique: true, nullable: true })
  email: string;

  @Column({ type: 'text' })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: UserRole;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status: UserStatus;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string | null;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.users)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @OneToMany(() => AgentEntity, (agent: any) => agent.user)
  agents: AgentEntity[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
