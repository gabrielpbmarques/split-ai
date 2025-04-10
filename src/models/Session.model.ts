export interface Session {
  _id?: string;
  sessionId: string;
  phoneNumber: string;
  workerData: any;
  lastAiResponse?: string;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt?: Date;
}
