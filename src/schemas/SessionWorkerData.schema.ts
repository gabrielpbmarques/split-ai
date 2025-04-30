import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Definindo PixObject localmente para evitar dependências circulares
@Schema({ _id: false })
class PixObject {
  @Prop({ type: String })
  type?: string;

  @Prop({ type: String })
  key?: string;

  @Prop({ type: Boolean })
  isRemoved?: boolean;

  @Prop({ type: Date })
  removedAt?: Date | null;
}

@Schema({ _id: false })
class PhoneData {
  @Prop({ type: String })
  countryCode?: string;

  @Prop({ type: String })
  areaCode?: string;

  @Prop({ type: String })
  number?: string;
}

@Schema({ _id: false })
class AddressData {
  @Prop({ type: String })
  zipCode?: string;

  @Prop({ type: String })
  street?: string;

  @Prop({ type: String })
  number?: string;

  @Prop({ type: String })
  complement?: string;

  @Prop({ type: String })
  neighborhood?: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: String })
  state?: string;

  @Prop({ type: String })
  country?: string;

  @Prop({ type: Number })
  cityCode?: number;
}

@Schema({ _id: false })
class DocumentValidationResult {
  @Prop({ type: String })
  documentNumber?: string;

  @Prop({ type: String })
  cpf?: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String })
  birthDate?: string;

  @Prop({ type: String })
  issueDate?: string;

  @Prop({ type: Number })
  faceMatchScore?: number;

  @Prop({ type: Boolean })
  documentHasFace?: boolean;

  @Prop({ type: Boolean })
  selfieHasFace?: boolean;

  @Prop({ type: Boolean })
  isMatch?: boolean;

  @Prop({ type: [String] })
  errors?: string[];
}

@Schema({ _id: false })
class DocumentsData {
  @Prop({ type: String })
  rgFrontId?: string;

  @Prop({ type: String })
  rgBackId?: string;

  @Prop({ type: String })
  tShirtSelfieId?: string;

  @Prop({ type: String, nullable: true })
  addressPictureId?: string | null;

  @Prop({ type: String })
  status?: string;

  @Prop({ type: Boolean })
  isRemoved?: boolean;

  @Prop({ type: Date, nullable: true })
  removedAt?: Date | null;

  @Prop({ type: [String] })
  observations?: string[];

  @Prop({ type: Date, nullable: true })
  dateValidated?: Date | null;

  @Prop({ type: String, nullable: true })
  validator?: string | null;

  @Prop({ type: DocumentValidationResult })
  documentValidationResult?: DocumentValidationResult;
}

@Schema()
export class SessionWorkerData {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  _id: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String })
  nickname?: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String })
  cpf?: string;

  @Prop({ type: Date })
  birthDate?: Date;

  @Prop({ type: String })
  gender?: string;

  @Prop({ type: PhoneData })
  phone?: PhoneData;

  @Prop({ type: AddressData })
  address?: AddressData;

  @Prop({ type: PixObject })
  pix?: PixObject;

  @Prop({ type: DocumentsData })
  documents?: DocumentsData;

  @Prop({ type: String, required: true })
  signupStage: string;

  @Prop({ type: String })
  status?: string;

  @Prop({ type: String })
  userId?: string;

  @Prop({ type: Boolean })
  isNewUser?: boolean;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const SessionWorkerDataSchema =
  SchemaFactory.createForClass(SessionWorkerData);
