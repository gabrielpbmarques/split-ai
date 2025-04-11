import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PhoneDocument = HydratedDocument<Phone>;

@Schema({ timestamps: true })
export class Phone {
  @Prop({ type: String, required: true })
  countryCode: string;

  @Prop({ type: String, required: true })
  areaCode: string;

  @Prop({ type: String, required: true })
  number: string;
}

export const PhoneSchema = SchemaFactory.createForClass(Phone);
