export type OrganizationStatus = 'active' | 'inactive';
export type OrganizationPlan = 'manual' | 'free' | 'monthly';

export interface Organization {
  id: string;
  name: string;
  acronym?: string;
  email_domain: string;
  status: OrganizationStatus;
  contact_name?: string;
  contact_email?: string;
  activated_at: Date;
  deactivated_at?: Date;
  plan: OrganizationPlan;
}
