import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { TokenType } from 'src/types/TokenType';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ timestamps: false })
class Coordinates {
  @Prop({ type: String, required: true, default: 'Point' })
  type: string;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: [Number], required: true })
  coordinates: number[];
}

@Schema({ timestamps: false })
class DateObject {
  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: Number, required: true })
  day: number;

  @Prop({ type: Number, required: true })
  month: number;

  @Prop({ type: Number, required: true })
  year: number;

  @Prop({ type: Number, required: true })
  hour: number;

  @Prop({ type: Number, required: true })
  minute: number;
}

@Schema({ timestamps: false })
class ActivityAddress {
  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  state: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  street: string;

  @Prop({ type: Number })
  number: number;

  @Prop({ type: String })
  neighborhood: string;

  @Prop({ type: String })
  cep: string;
}

@Schema({ timestamps: false })
export class Token {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, immutable: true })
  _id: ObjectId;

  @Prop({ type: String, required: true, immutable: true })
  type: TokenType;

  @Prop({ type: Boolean, default: false, immutable: true })
  validated: boolean;

  @Prop({ type: Date, required: true })
  validatedAt: Date;
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: [String], default: [] })
  additionalInfo: string[];

  @Prop({ type: [String], default: [] })
  dynamicProducts: string[];

  @Prop({ type: [String], default: [] })
  entries: string[];

  @Prop({ type: [String], default: [] })
  excludedBadgesId: string[];

  @Prop({ type: [String], default: [] })
  executionProblems: string[];

  @Prop({ type: [String], default: [] })
  expiredProductsId: string[];

  @Prop({ type: [String], default: [] })
  foundProductsId: string[];

  @Prop({ type: Number, default: 3 })
  minimumWarehousePictures: number;

  @Prop({ type: [String], default: [] })
  nearExpirationProductsId: string[];

  @Prop({ type: [String], default: [] })
  outOfShelfProductsId: string[];

  @Prop({ type: [String], default: [] })
  outOfStorageProductsId: string[];

  @Prop({ type: [String], default: [] })
  pickingOrdersIds: string[];

  @Prop({ type: [String], default: [] })
  picturesFinishId: string[];

  @Prop({ type: [String], default: [] })
  picturesStartId: string[];

  @Prop({ type: [String], default: [] })
  productCountIds: string[];

  @Prop({ type: [String], default: [] })
  productPricesId: string[];

  @Prop({ type: [String], default: [] })
  ratingIds: string[];

  @Prop({ type: [String], default: [] })
  ratingReasonsIds: string[];

  @Prop({ type: [String], default: [] })
  requiredBadgesId: string[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: Number, default: 0 })
  rescheduleCount: number;

  @Prop({ type: [String], default: [] })
  restockedProductsId: string[];

  @Prop({ type: [String], default: [] })
  ruptureChecks: string[];

  @Prop({ type: [String], default: [] })
  ruptureProductsId: string[];

  @Prop({ type: [String], default: [] })
  shelfShareConfigIds: string[];

  @Prop({ type: Boolean, default: false })
  isSubsidized: boolean;

  @Prop({ type: Boolean, default: true })
  availableForGigWorkers: boolean;

  @Prop({ type: Boolean, default: false })
  isTrial: boolean;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: String, required: true })
  jobId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  companyId: string;

  @Prop({ type: String, required: true })
  productGroupId: string;

  @Prop({ type: String, required: true })
  establishmentId: string;

  @Prop({ type: String, default: null })
  expiredProductCountConfig: string | null;

  @Prop({ type: String, required: true })
  missionType: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: () => Coordinates })
  coordinates: Coordinates;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Boolean, default: false })
  retryable: boolean;

  @Prop({ type: String, default: null })
  jobType: string | null;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, default: '' })
  videoUri: string;

  @Prop({ type: String, default: null })
  certificationId: string | null;

  @Prop({ type: Number })
  __v: number;

  @Prop({ type: String })
  jobTemplateId: string;

  @Prop({ type: Number })
  actualPrice: number;

  @Prop({ type: String })
  cityGroupId: string;

  @Prop({ type: String })
  establishmentName: string;

  @Prop({ type: ActivityAddress })
  activityAddress: ActivityAddress;

  @Prop({ type: String })
  companyName: string;

  @Prop({ type: String })
  companyChainId: string;

  @Prop({ type: String })
  establishmentChainId: string;

  @Prop({ type: DateObject })
  initialDate: DateObject;

  @Prop({ type: Date })
  initialFormattedDate: Date;

  @Prop({ type: DateObject })
  date: DateObject;

  @Prop({ type: Date })
  formattedDate: Date;

  @Prop({ type: Boolean, default: false })
  isRetry: boolean;

  @Prop({ type: String })
  companyExigence: string;

  @Prop({ type: Date })
  startDateTime: Date;

  @Prop({ type: Date })
  endDateTime: Date;

  @Prop({ type: String })
  workerId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  checkIn: ObjectId;

  @Prop({ type: [Token], default: [] })
  tokens: Token[];
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
