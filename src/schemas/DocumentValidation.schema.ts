import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: false })
export class DocumentValidation {
  @Prop({ type: Boolean, default: false })
  isValid: boolean;

  @Prop({ type: Number, default: 0 })
  faceMatchScore: number;

  @Prop({ type: Number, default: 0 })
  documentAuthenticityScore: number;

  @Prop({ type: Date })
  validatedAt: Date;

  @Prop({ type: [String], default: [] })
  errors: string[];

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;
}

export const DocumentValidationSchema =
  SchemaFactory.createForClass(DocumentValidation);
