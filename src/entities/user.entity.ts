import { UserRole, UserStatus } from 'src/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', unique: true, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  document: string;

  @Column({ type: 'text', nullable: true })
  document_type: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

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

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
