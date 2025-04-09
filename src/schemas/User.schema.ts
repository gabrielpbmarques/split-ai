import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
class Address {
  @Prop({ type: String })
  street: string;

  @Prop({ type: String })
  number: string;

  @Prop({ type: String })
  complement: string;

  @Prop({ type: String })
  neighborhood: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  state: string;

  @Prop({ type: String })
  zipCode: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  cpf: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String, default: 'personal_info' })
  signupStage: string;

  @Prop({ type: Date })
  birthDate: Date;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: Address })
  address: Address;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
