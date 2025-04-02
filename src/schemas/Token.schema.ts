import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Schema as MongooseSchema } from 'mongoose';
import type { TokenType } from 'src/types/TokenType';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop({ type: String, required: true })
  token: string;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  activityId: ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  workerId: ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  createdBy: ObjectId;

  @Prop({ type: Boolean, default: false })
  validated: boolean;

  @Prop({ type: String, required: true })
  type: TokenType;

  @Prop({ type: Date, default: null })
  validatedAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
