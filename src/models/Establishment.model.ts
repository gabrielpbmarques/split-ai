import { ObjectId } from 'mongoose';

export interface Coordinates {
  type: string;
  _id?: ObjectId;
  coordinates: number[];
}

export interface Establishment {
  _id?: ObjectId;
  additionalInfo: string[];
  canRequestMission: boolean;
  daysClosed: number[];
  requirements: string[];
  favoriteWorkers: string[];
  accountManagerId: string;
  addressId: string;
  canStoreOrder: boolean;
  closingHour: string;
  cnpj: string;
  companyId: string;
  coordinates: Coordinates;
  managerEmail: string;
  managerName: string;
  managerPhoneId: string;
  name: string;
  openingHour: string;
  phoneId: string;
  qrCodeLocation: string;
  qrCodeText: string;
  status: string;
  statusChangedBy: string;
  hasTokenGenerationAccess: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  formattedOpeningHour?: Date;
  formattedClosingHour?: Date;
  cityGroupId: string;
  __v?: number;
}
