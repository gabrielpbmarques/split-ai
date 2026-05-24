export type OrganizationStatus = 'active' | 'inactive';
import { PlanEntity } from 'src/entities/plan.entity';

export interface Organization {
  id?: string;
  name: string;
  acronym?: string;
  email_domain: string;
  status: OrganizationStatus;
  contact_name?: string;
  contact_email?: string;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
  activated_at?: Date;
  deactivated_at?: Date;
  plan?: PlanEntity;
  database_url?: string | null;
  // Embeddable chat widget settings
  chat_embed_enabled?: boolean;
  chat_embed_token?: string | null;
  chat_embed_agent_id?: string | null;
  chat_embed_primary_color?: string | null;
  chat_embed_button_position?:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left';
  chat_embed_greeting?: string | null;
  chat_embed_welcome_enabled?: boolean;
}
