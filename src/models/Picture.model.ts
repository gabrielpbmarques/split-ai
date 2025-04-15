import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ImageType {
  PROFILE = 'profile',
  DOCUMENT_BACK = 'document-back',
  DOCUMENT_FRONT = 'document-front',
  T_SHIRT_SELFIE = 't-shirt-selfie',
}

@Schema({ timestamps: true })
export class Picture {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true, enum: ImageType })
  type: ImageType;
}

export type PictureDocument = Picture & Document;
export const PictureSchema = SchemaFactory.createForClass(Picture);
