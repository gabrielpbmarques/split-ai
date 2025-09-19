export type UserRole =
  | 'citizen'
  | 'security_force'
  | 'admin'
  | 'establishment'
  | 'security_force_central';
export type UserStatus = 'pending' | 'active' | 'inactive';

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
  phone: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}
