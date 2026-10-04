import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AgentEntity } from 'src/infrastructure/database/schema/agent.entity';
import { PlanEntity } from 'src/infrastructure/database/schema/plan.entity';
import { UserEntity } from 'src/infrastructure/database/schema/user.entity';
import type { Organization, OrganizationStatus } from 'src/shared/contracts';

@Entity('organizations')
export class OrganizationEntity implements Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  acronym: string;

  @Column({ type: 'text' })
  email_domain: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: OrganizationStatus;

  @Column({ type: 'text', nullable: true })
  contact_name: string;

  @Column({ type: 'text', nullable: true })
  contact_email: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({
    type: 'timestamp',
    name: 'activated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  activated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deactivated_at: Date;

  @Column({ type: 'text', nullable: true })
  database_url: string | null;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'plan_id' })
  plan: PlanEntity;

  // Embeddable chat widget settings
  @Column({ type: 'boolean', default: false })
  chat_embed_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  chat_embed_token: string;

  @Column({ type: 'uuid', nullable: true })
  chat_embed_agent_id: string;

  @Column({ type: 'text', nullable: true })
  chat_embed_primary_color: string;

  @Column({
    type: 'enum',
    enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    default: 'bottom-right',
  })
  chat_embed_button_position:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left';

  @Column({ type: 'text', nullable: true })
  chat_embed_greeting: string;

  @Column({ type: 'boolean', default: false })
  chat_embed_welcome_enabled: boolean;

  @OneToMany(() => UserEntity, (user) => user.organization)
  users: UserEntity[];

  @OneToMany(() => AgentEntity, (agent: any) => agent.organization)
  agents: AgentEntity[];
}
