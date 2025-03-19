import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Activity } from 'src/models/Activity.model';
import { Establishment } from 'src/models/Establishment.model';
import {
  Activity as ActivitySchema,
  ActivityDocument,
} from 'src/schemas/Activity.schema';

export interface IActivityRepository {
  findById(id: string): Promise<Activity | null>;
  update(id: string, payload: Partial<Activity>): Promise<Activity | null>;
  checkEstablishmentTokenAccess(activityId: string): Promise<boolean>;
}

@Injectable()
export class ActivityRepository implements IActivityRepository {
  constructor(
    @InjectModel(ActivitySchema.name)
    private activityModel: Model<ActivityDocument>,
  ) {}

  async findById(id: string): Promise<Activity | null> {
    const activity = await this.activityModel.findById(id).exec();
    return activity as unknown as Activity | null;
  }

  async update(
    id: string,
    payload: Partial<Activity>,
  ): Promise<Activity | null> {
    const updatedActivity = await this.activityModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    return updatedActivity as unknown as Activity | null;
  }

  async checkEstablishmentTokenAccess(activityId: string): Promise<boolean> {
    // First get the activity document
    const activity = await this.findById(activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Use direct MongoDB lookup which we know works from our logs
    const establishmentId = activity.establishmentId.toString();
    const establishment = (await this.activityModel.db
      .collection('establishments')
      .findOne({
        _id: new mongoose.Types.ObjectId(establishmentId),
      })) as unknown as Establishment | null;

    // If we couldn't find the establishment, return false
    if (!establishment) {
      throw new Error('Establishment not found');
    }

    // Check if the establishment has the hasTokenGenerationAccess property
    if ('hasTokenGenerationAccess' in establishment) {
      return !!establishment.hasTokenGenerationAccess;
    }

    return false;
  }
}
