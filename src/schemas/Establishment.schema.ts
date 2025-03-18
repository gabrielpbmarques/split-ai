import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Schema as MongooseSchema } from 'mongoose';

export type EstablishmentDocument = HydratedDocument<Establishment>;

@Schema()
export class Coordinates {
  @Prop({ type: String, default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: number[];
}

const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);

@Schema({ timestamps: true })
export class Establishment {
  @Prop({ type: [String], default: [] })
  additionalInfo: string[];

  @Prop({ type: Boolean, default: true })
  canRequestMission: boolean;

  @Prop({ type: [Number], default: [] })
  daysClosed: number[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: [String], default: [] })
  favoriteWorkers: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  accountManagerId: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  addressId: ObjectId;

  @Prop({ type: Boolean, default: false })
  canStoreOrder: boolean;

  @Prop({ type: String, required: true })
  closingHour: string;

  @Prop({ type: String, required: true })
  cnpj: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  companyId: ObjectId;

  @Prop({ type: CoordinatesSchema })
  coordinates: Coordinates;

  @Prop({ type: String, default: '' })
  managerEmail: string;

  @Prop({ type: String, default: '' })
  managerName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  managerPhoneId: ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  openingHour: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  phoneId: ObjectId;

  @Prop({ type: String, default: '' })
  qrCodeLocation: string;

  @Prop({ type: String, default: '' })
  qrCodeText: string;

  @Prop({ type: String, default: 'active' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  statusChangedBy: ObjectId;

  @Prop({ type: Boolean, default: false })
  hasTokenGenerationAccess: boolean;

  @Prop({ type: Date })
  formattedOpeningHour: Date;

  @Prop({ type: Date })
  formattedClosingHour: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  cityGroupId: ObjectId;
}

export const EstablishmentSchema = SchemaFactory.createForClass(Establishment);

EstablishmentSchema.index({ coordinates: '2dsphere' });
