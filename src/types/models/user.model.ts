export type UserRole = 'user' | 'admin' | 'guest';
export type UserStatus = 'active' | 'inactive';
export type UserOrigin = 'whatsapp' | 'website' | 'app';

// Role of a user inside its organization (whitelabel multi-user model).
export type OrgRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  document: string;
  document_type: string;
  organization_id: string;
  birth_date: Date;
  password_hash: string;
  role: UserRole;
  org_role: OrgRole;
  phone: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}
