import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String, default: 'worker' })
  type: string;

  @Prop({ type: String, default: null })
  validationCode: string | null;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: String })
  workerId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  profilePictureId: ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
