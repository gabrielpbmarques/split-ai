import { Injectable } from '@nestjs/common';
import { ActivityRepository } from 'src/repositories/Activity.repository';
import { EstablishmentRepository } from 'src/repositories/Establishment.repository';

@Injectable()
export class CheckActivityTokenNeedService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(activityId: string): Promise<boolean> {
    const activity = await this.activityRepository.findById(activityId);

    if (!activity) {
      throw new Error('Activity not found');
    }

    const establishment = await this.establishmentRepository.findById(
      activity.establishmentId,
    );

    return establishment.hasTokenGenerationAccess;
  }
}
