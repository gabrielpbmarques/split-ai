import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { TokenType } from 'src/types/TokenType';

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

  @Prop({ type: String, required: true })
  type: TokenType;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
