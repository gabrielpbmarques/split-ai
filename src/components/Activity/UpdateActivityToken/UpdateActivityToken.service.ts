import { Injectable } from '@nestjs/common';
import { Activity } from 'src/models/Activity.model';
import { Token } from 'src/models/Token.model';
import { ActivityRepository } from 'src/repositories/Activity.repository';

@Injectable()
export class UpdateActivityTokenService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(
    token: Pick<Token, '_id' | 'type' | 'validated' | 'validatedAt'>,
    activityId: string,
  ): Promise<Activity> {
    const { _id, type, validated, validatedAt } = token;
    const activity = await this.activityRepository.findById(activityId);

    if (!activity) {
      throw new Error('Activity not found');
    }

    activity.tokens.push({
      _id,
      type,
      validated,
      validatedAt,
    });

    return this.activityRepository.update(activityId, activity);
  }
}
