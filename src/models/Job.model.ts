import { ObjectId } from 'mongoose';

export interface Coordinate {
  _id?: ObjectId;
  type: string;
  isRemoved: boolean;
  removedAt: Date | null;
  coordinates: number[];
}

export interface Job {
  _id?: ObjectId;
  days: number[];
  activitiesId: string[];
  requiredBadgesId: string[];
  excludedBadgesId: string[];
  additionalInfo: string[];
  requirements: string[];
  ratingReasonsIds: string[];
  isTemplate: boolean;
  templateActiveInPanel: boolean;
  isSubsidized: boolean;
  isTrial: boolean;
  minimumWarehousePictures: number;
  isRemoved: boolean;
  removedAt: Date | null;
  companyId: string;
  productGroupId: string;
  time: string;
  initialTime: string;
  missionType: string;
  recurrent: string;
  status: string;
  companyExigence: string;
  price: number;
  jobType: string | null;
  description: string;
  certificationGroupId: string | null;
  videoUri: string;
  templateTitle: string;
  userId: string;
  workerPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  certificationId: string | null;
  templateStatus: string;
  userName: string;
  startsAt: Date;
  jobTemplate: ObjectId;
  establishmentId: string;
  pointsUsed: number;
  pointsPerMission: number;
  durationInHours: number;
  coordinates: Coordinate;
}
