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

import { AgentEntity } from 'src/infrastructure/database/schema/agent.entity';
import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';
import type {
  OrgRole,
  UserOrigin,
  UserRole,
  UserStatus,
} from 'src/shared/contracts';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', unique: true, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'guest'],
    default: 'user',
  })
  role: UserRole;

  // Capability level within the organization (owner > admin > member).
  @Column({
    type: 'enum',
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  })
  org_role: OrgRole;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status: UserStatus;

  // SHA-256 hash of a pending invitation token (null once the invite is accepted).
  @Column({ type: 'text', nullable: true })
  invite_token_hash: string | null;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string | null;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.users)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @OneToMany(() => AgentEntity, (agent: any) => agent.user)
  agents: AgentEntity[];

  @Column({
    type: 'enum',
    enum: ['whatsapp', 'website', 'app'],
    default: 'website',
  })
  origin: UserOrigin;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
