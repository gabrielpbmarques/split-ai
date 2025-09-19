import { Injectable } from '@nestjs/common';
import { CreateSessionIfNotExistsDto } from './create-session-if-not-exists.dto';
import { SessionRepository } from 'src/repositories/session.repository';
import { SessionEntity } from 'src/entities/session.entity';
import * as moment from 'moment';

@Injectable()
export class CreateSessionIfNotExistsService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(
    dto: CreateSessionIfNotExistsDto,
    createNew: boolean = false,
  ): Promise<SessionEntity> {
    const { agent_id, user_id } = dto;
    const activeSession =
      await this.sessionRepository.findActiveSessionByUserId(user_id);

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
