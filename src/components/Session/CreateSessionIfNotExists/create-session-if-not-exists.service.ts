import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { SessionEntity } from 'src/entities';
import { SessionRepository } from 'src/repositories';

import { CreateSessionIfNotExistsDto } from './create-session-if-not-exists.dto';

@Injectable()
export class CreateSessionIfNotExistsService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    dto: CreateSessionIfNotExistsDto,
    createNew: boolean = false,
  ): Promise<SessionEntity> {
    const { agent_id, user_id } = dto;
    const activeSession =
      await this.sessionRepository.findActiveSessionByUserAndAgent(
        user_id,
        agent_id,
      );

    if (activeSession && !createNew) return activeSession;

    if (user_id) {
      await this.sessionRepository.expireAllSessionsByUserId(user_id);
    }

    return this.sessionRepository.create({
      agent_id,
      user_id,
      expires_at: moment().add(1, 'day').toDate(),
    });
  }
}
