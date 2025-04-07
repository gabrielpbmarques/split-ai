import { ObjectId } from 'mongoose';

export interface DocumentsObject {
  _id?: ObjectId;
  isRemoved: boolean;
  removedAt: Date | null;
  tShirtSelfieId: string;
  rgFrontId: string;
  rgBackId: string;
  addressPictureId: string | null;
  status: string;
  observations: string[];
  dateValidated: Date | null;
  validator: string | null;
}

export interface GeoPoint {
  _id?: ObjectId;
  type: string;
  isRemoved: boolean;
  removedAt: Date | null;
  coordinates: number[];
}

export interface RgObject {
  _id?: ObjectId;
  isRemoved: boolean;
  removedAt: Date | null;
  number: string;
  issuer: string;
  issueDate: Date | null;
}

export interface CommunicationObject {
  _id?: ObjectId;
  agree: boolean;
  isRemoved: boolean;
  removedAt: Date | null;
  agreeDate: Date;
}

export interface PixObject {
  _id?: ObjectId;
  type: string;
  key: string;
  isRemoved: boolean;
  removedAt: Date | null;
}

export interface Worker {
  _id?: ObjectId;
  availableRatingContests: number;
  averageRating: number;
  badges: string[];
  biometryStatus: string;
  documents: DocumentsObject;
  hasNoShowedOnLastMission: boolean;
  favoriteGeo: GeoPoint;
  health: number;
  integratedWithOpa: boolean;
  intendedMeansOfTransportation: string[];
  intendedWorkingPeriodsPerWeek: string[];
  precision: number;
  pushId: string;
  reservationLimit: number;
  rg: RgObject;
  status: string;
  isGigWorker: boolean;
  gender: string;
  comunication: CommunicationObject;
  hasPassport: boolean;
  migrated: boolean;
  paymentProvider: string;
  maxActivityViewRadiusInKm: number;
  allowedDaysToReserveInAdvance: number;
  isRemoved: boolean;
  removedAt: Date | null;
  birthDate: Date;
  cpf: string;
  email: string;
  name: string;
  nickname: string;
  phoneId: string;
  signupStage: string;
  userId: string;
  hashCpf: string;
  blocks: string[];
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  cityGroupId: string;
  cityGroupWorkerStatus: string;
  addressId: string;
  bankAccount: ObjectId;
  motherName: string;
  pix: PixObject;
  trialEndDateTime: Date | null;
}
