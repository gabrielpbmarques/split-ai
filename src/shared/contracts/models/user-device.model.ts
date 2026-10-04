export interface UserDevice {
  id: string;
  user_id: string;
  device_token: string | null;
  device_fingerprint?: string;
  device_type: 'android' | 'ios' | 'web';
  device_name?: string;
  is_active: boolean;
  last_used_at: Date;
  created_at: Date;
  updated_at: Date;
}
