import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  session_id: string;

  @Column({ type: 'uuid', nullable: false })
  agent_id: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string;

  @Column({
    type: 'enum',
    enum: ['appointment', 'order', 'faq'],
    nullable: false,
  })
  type: 'appointment' | 'order' | 'faq';

  @Column({
    type: 'enum',
    enum: ['positive', 'negative', 'neutral'],
    nullable: false,
  })
  sentiment: 'positive' | 'negative' | 'neutral';

  @Column({ type: 'text', nullable: false })
  summary: string;

  @Column({ type: 'text', nullable: true })
  insights: string;

  @Column({ type: 'text', nullable: true })
  return: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
