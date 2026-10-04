export interface SmsVerification {
  id: string;
  phone: string;
  code: string;
  verified: boolean;
  expiresAt: Date;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}
