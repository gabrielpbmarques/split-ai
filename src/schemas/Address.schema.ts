import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: String, required: true })
  street: string;

  @Prop({ type: String, required: true })
  number: string;

  @Prop({ type: String, required: true })
  neighborhood: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, required: true })
  zipCode: string;

  @Prop({ type: String, required: true })
  country: string;

  @Prop({ type: String, required: true })
  cityCode: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
