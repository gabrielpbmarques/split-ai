import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Schema as MongooseSchema } from 'mongoose';

export type WorkerDocument = HydratedDocument<Worker>;

@Schema({ timestamps: false })
class DocumentData {
  @Prop({ type: String })
  documentNumber: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  birthDate: string;

  @Prop({ type: String })
  issueDate: string;

  @Prop({ type: Number })
  faceMatchScore: number;

  @Prop({ type: Boolean })
  documentHasFace: boolean;

  @Prop({ type: Boolean })
  selfieHasFace: boolean;

  @Prop({ type: Boolean })
  isMatch: boolean;

  @Prop({ type: String })
  cpf: string;

  @Prop({ type: [String], default: [] })
  errors: string[];
}

@Schema({ timestamps: false })
class DocumentsObject {
  @Prop({ type: String })
  tShirtSelfieId: string;

  @Prop({ type: String })
  rgFrontId: string;

  @Prop({ type: String })
  rgBackId: string;

  @Prop({ type: String, default: null })
  addressPictureId: string | null;

  @Prop({ type: String })
  status: string;

  @Prop({ type: [String], default: [] })
  observations: string[];

  @Prop({ type: DocumentData, default: {} })
  documentValidationResult: DocumentData;

  @Prop({ type: Date, default: null })
  dateValidated: Date | null;

  @Prop({ type: String, default: null })
  validator: string | null;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;
}

@Schema({ timestamps: false })
class GeoPoint {
  @Prop({ type: String, default: 'Point' })
  type: string;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: [Number] })
  coordinates: number[];
}

@Schema({ timestamps: false })
class RgObject {
  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: String, default: '' })
  number: string;

  @Prop({ type: String, default: '' })
  issuer: string;

  @Prop({ type: Date, default: null })
  issueDate: Date | null;
}

@Schema({ timestamps: false })
class CommunicationObject {
  @Prop({ type: Boolean, default: true })
  agree: boolean;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: Date })
  agreeDate: Date;
}

@Schema({ timestamps: false })
class PixObject {
  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  key: string;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;
}

@Schema({ timestamps: true })
export class Worker {
  @Prop({ type: Number, default: 0 })
  availableRatingContests: number;

  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @Prop({ type: [String], default: [] })
  badges: string[];

  @Prop({ type: String, default: 'inactive' })
  biometryStatus: string;

  @Prop({ type: DocumentsObject })
  documents: DocumentsObject;

  @Prop({ type: Boolean, default: false })
  hasNoShowedOnLastMission: boolean;

  @Prop({ type: GeoPoint })
  favoriteGeo: GeoPoint;

  @Prop({ type: Number, default: 0 })
  health: number;

  @Prop({ type: Boolean, default: false })
  integratedWithOpa: boolean;

  @Prop({ type: [String], default: [] })
  intendedMeansOfTransportation: string[];

  @Prop({ type: [String], default: [] })
  intendedWorkingPeriodsPerWeek: string[];

  @Prop({ type: Number, default: 0 })
  precision: number;

  @Prop({ type: String, default: '' })
  pushId: string;

  @Prop({ type: Number, default: 10 })
  reservationLimit: number;

  @Prop({ type: RgObject })
  rg: RgObject;

  @Prop({ type: String, default: 'pending' })
  status: string;

  @Prop({ type: Boolean, default: true })
  isGigWorker: boolean;

  @Prop({ type: String })
  gender: string;

  @Prop({
    type: CommunicationObject,
    default: { agree: false, agreeDate: null },
  })
  comunication: CommunicationObject;

  @Prop({
    type: CommunicationObject,
    default: { agree: false, agreeDate: null },
  })
  terms: CommunicationObject;

  @Prop({ type: Boolean, default: false })
  hasLegalAge: boolean;

  @Prop({ type: Boolean, default: false })
  hasPassport: boolean;

  @Prop({ type: Boolean, default: false })
  migrated: boolean;

  @Prop({ type: String, default: 'IUGU' })
  paymentProvider: string;

  @Prop({ type: Number, default: 25 })
  maxActivityViewRadiusInKm: number;

  @Prop({ type: Number, default: 5 })
  allowedDaysToReserveInAdvance: number;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: Date })
  birthDate: Date;

  @Prop({ type: String })
  cpf: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  nickname: string;

  @Prop({ type: String })
  phoneId: string;

  @Prop({ type: String, default: 'end' })
  signupStage: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  hashCpf: string;

  @Prop({ type: [String], default: [] })
  blocks: string[];

  @Prop({ type: String })
  cityGroupId: string;

  @Prop({ type: String, default: 'working' })
  cityGroupWorkerStatus: string;

  @Prop({ type: String })
  addressId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  bankAccount: ObjectId;

  @Prop({ type: String })
  motherName: string;

  @Prop({ type: PixObject })
  pix: PixObject;

  @Prop({ type: Date, default: null })
  trialEndDateTime: Date | null;
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);
