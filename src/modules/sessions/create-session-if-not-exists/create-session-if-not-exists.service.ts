import { Injectable } from '@nestjs/common';
import moment from 'moment';

import { SessionEntity } from 'src/infrastructure/database/schema';
import { CreateSessionIfNotExistsDto } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.dto';
import { SessionRepository } from 'src/modules/sessions/repositories/session.repository';

@Injectable()
export class CreateSessionIfNotExistsService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    dto: CreateSessionIfNotExistsDto,
    createNew: boolean = false,
  ): Promise<SessionEntity> {
    const { agent_id, user_id, organization_id } = dto;
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
      organization_id,
      expires_at: moment().add(1, 'day').toDate(),
    });
  }
}
