import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AgentEntity } from 'src/infrastructure/database/schema/agent.entity';
import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';
import {
  OrgRole,
  UserOrigin,
  UserRole,
  UserStatus,
} from 'src/shared/contracts';

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

  @Column({
    type: 'enum',
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  })
  org_role!: OrgRole;

  @Column({ type: 'text', nullable: true })
  phone!: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status!: UserStatus;

  @Column({ type: 'text', nullable: true })
  invite_token_hash!: string | null;

  @Column({ type: 'uuid', nullable: true })
  organization_id!: string | null;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.users)
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

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
