import { Injectable } from '@nestjs/common';
import { SessionEntity } from 'src/entities';
import { SessionRepository } from 'src/repositories';

import { GetActiveSessionDto } from './get-active-session.dto';

@Injectable()
export class GetActiveSessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(dto: GetActiveSessionDto): Promise<SessionEntity> {
    const { user_id } = dto;

    return this.sessionRepository.findActiveSessionByUserId(user_id);
  }
}
