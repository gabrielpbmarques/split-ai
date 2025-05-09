import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: false })
class Coordinate {
  @Prop({ type: String, default: 'Point' })
  type: string;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: [Number] })
  coordinates: number[];
}

@Schema({ timestamps: true })
export class Job {
  @Prop({ type: [Number], default: [] })
  days: number[];

  @Prop({ type: [String], default: [] })
  activitiesId: string[];

  @Prop({ type: [String], default: [] })
  requiredBadgesId: string[];

  @Prop({ type: [String], default: [] })
  excludedBadgesId: string[];

  @Prop({ type: [String], default: [] })
  additionalInfo: string[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: [String], default: [] })
  ratingReasonsIds: string[];

  @Prop({ type: Boolean, default: false })
  isTemplate: boolean;

  @Prop({ type: Boolean, default: true })
  templateActiveInPanel: boolean;

  @Prop({ type: Boolean, default: false })
  isSubsidized: boolean;

  @Prop({ type: Boolean, default: false })
  isTrial: boolean;

  @Prop({ type: Number, default: 3 })
  minimumWarehousePictures: number;

  @Prop({ type: Boolean, default: false })
  isRemoved: boolean;

  @Prop({ type: Date, default: null })
  removedAt: Date | null;

  @Prop({ type: String })
  companyId: string;

  @Prop({ type: String })
  productGroupId: string;

  @Prop({ type: String })
  time: string;

  @Prop({ type: String })
  initialTime: string;

  @Prop({ type: String })
  missionType: string;

  @Prop({ type: String })
  recurrent: string;

  @Prop({ type: String, default: 'active' })
  status: string;

  @Prop({ type: String })
  companyExigence: string;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: String, default: null })
  jobType: string | null;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, default: null })
  certificationGroupId: string | null;

  @Prop({ type: String, default: '' })
  videoUri: string;

  @Prop({ type: String })
  templateTitle: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: Number })
  workerPrice: number;

  @Prop({ type: String, default: null })
  certificationId: string | null;

  @Prop({ type: String, default: 'active' })
  templateStatus: string;

  @Prop({ type: String })
  userName: string;

  @Prop({ type: Date })
  startsAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  jobTemplate: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  establishmentId: string;

  @Prop({ type: Number })
  pointsUsed: number;

  @Prop({ type: Number })
  pointsPerMission: number;

  @Prop({ type: Number })
  durationInHours: number;

  @Prop({ type: Coordinate })
  coordinates: Coordinate;
}

export const JobSchema = SchemaFactory.createForClass(Job);
