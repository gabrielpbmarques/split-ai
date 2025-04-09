export interface Session {
  _id?: string;
  sessionId: string;
  phoneNumber: string;
  workerData: any;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt?: Date;
}
