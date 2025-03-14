import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity } from 'src/models/Activity.model';
import { Activity as ActivitySchema, ActivityDocument } from 'src/schemas/Activity.schema';

export interface IActivityRepository {
  findById(id: string): Promise<Activity | null>;
  update(id: string, payload: Partial<Activity>): Promise<Activity | null>;
}

@Injectable()
export class ActivityRepository implements IActivityRepository {
  constructor(
    @InjectModel(ActivitySchema.name) private activityModel: Model<ActivityDocument>
  ) {}

  async findById(id: string): Promise<Activity | null> {
    const activity = await this.activityModel.findById(id).exec();
    return activity as unknown as Activity | null;
  }

  async update(id: string, payload: Partial<Activity>): Promise<Activity | null> {
    const updatedActivity = await this.activityModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    return updatedActivity as unknown as Activity | null;
  }
}
