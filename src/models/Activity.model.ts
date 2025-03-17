import { ObjectId } from 'mongoose';
import type { TokenType } from 'src/types/TokenType';

export interface Coordinates {
  type: string;
  _id?: ObjectId;
  isRemoved: boolean;
  removedAt: Date | null;
  coordinates: number[];
}

export interface DateObject {
  _id?: ObjectId;
  isRemoved: boolean;
  removedAt: Date | null;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
}

export interface ActivityAddress {
  country: string;
  state: string;
  city: string;
  street: string;
  number: number;
  neighborhood: string;
  cep: string;
}

export interface Token {
  _id: ObjectId;
  type: TokenType;
  validated: boolean;
  validatedAt: Date;
}

export interface Activity {
  _id?: ObjectId;
  additionalInfo: string[];
  dynamicProducts: string[];
  entries: string[];
  excludedBadgesId: string[];
  executionProblems: string[];
  expiredProductsId: string[];
  foundProductsId: string[];
  minimumWarehousePictures: number;
  nearExpirationProductsId: string[];
  outOfShelfProductsId: string[];
  outOfStorageProductsId: string[];
  pickingOrdersIds: string[];
  picturesFinishId: string[];
  picturesStartId: string[];
  productCountIds: string[];
  productPricesId: string[];
  ratingIds: string[];
  ratingReasonsIds: string[];
  requiredBadgesId: string[];
  requirements: string[];
  rescheduleCount: number;
  restockedProductsId: string[];
  ruptureChecks: string[];
  ruptureProductsId: string[];
  shelfShareConfigIds: string[];
  isSubsidized: boolean;
  availableForGigWorkers: boolean;
  isTrial: boolean;
  isRemoved: boolean;
  removedAt: Date | null;
  jobId: string;
  userId: string;
  companyId: string;
  productGroupId: string;
  establishmentId: string;
  expiredProductCountConfig: string | null;
  missionType: string;
  status: string;
  coordinates: Coordinates;
  price: number;
  retryable: boolean;
  jobType: string | null;
  description: string;
  videoUri: string;
  createdAt?: Date;
  updatedAt?: Date;
  certificationId: string | null;
  __v: number;
  jobTemplateId: string;
  actualPrice: number;
  cityGroupId: string;
  establishmentName: string;
  activityAddress: ActivityAddress;
  companyName: string;
  companyChainId: string;
  establishmentChainId: string;
  initialDate: DateObject;
  initialFormattedDate: Date;
  date: DateObject;
  formattedDate: Date;
  isRetry: boolean;
  companyExigence: string;
  startDateTime: Date;
  endDateTime: Date;
  workerId: string;
  checkIn: ObjectId;
  tokens: Token[];
}
