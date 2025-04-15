import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ImageType } from 'src/models/Picture.model';

@Schema({ timestamps: true })
export class Picture {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true, enum: Object.values(ImageType) })
  type: string;
}

export type PictureDocument = Picture & Document;
export const PictureSchema = SchemaFactory.createForClass(Picture);
