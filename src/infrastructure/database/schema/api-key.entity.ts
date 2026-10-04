import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrganizationEntity } from 'src/infrastructure/database/schema/organization.entity';

/**
 * Programmatic (server-to-server) API key for an organization. The full secret
 * is shown only once at creation time; only its SHA-256 hash is persisted.
 * Distinct from `organizations.chat_embed_token`, which is the publishable key
 * for the public chat widget.
 */
@Entity('api_keys')
@Index('api_keys_key_hash_uq', ['key_hash'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'text' })
  name: string;

  // Human-readable prefix shown in listings (e.g. `sk_live_ab12…`).
  @Column({ type: 'text' })
  key_prefix: string;

  // SHA-256 hex digest of the full secret. The secret itself is never stored.
  @Column({ type: 'text' })
  key_hash: string;

  @Column('text', { array: true, nullable: true })
  scopes: string[] | null;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at: Date | null;

  @Column({ type: 'uuid', nullable: true })
  created_by: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
