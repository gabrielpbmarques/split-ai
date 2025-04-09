import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true, unique: true })
  sessionId: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: Object, default: {} })
  workerData: any;

  @Prop({ type: Date, default: Date.now })
  lastInteraction: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
