import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/entities/session.entity';
import { FindOneOptions, MoreThan, Repository } from 'typeorm';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repository: Repository<SessionEntity>,
  ) {}

  async create(data: Partial<SessionEntity>): Promise<SessionEntity> {
    const session = this.repository.create(data);
    return await this.repository.save(session);
  }

  async findById(id: string): Promise<SessionEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<SessionEntity>,
  ): Promise<SessionEntity | null> {
    return await this.repository.findOne(options);
  }

  async findActiveSessionByUserAndAgent(
    userId: string,
    agentId: string,
  ): Promise<SessionEntity | null> {
    return await this.repository.findOne({
      where: {
        user_id: userId,
        agent_id: agentId,
        expires_at: MoreThan(new Date()),
        expired: false,
      },
    });
  }

  async updateExpiredSession(sessionId: string): Promise<void> {
    await this.repository.update(sessionId, { expired: true });
  }

  async expireAllSessionsByUserId(userId: string): Promise<void> {
    await this.repository.update({ user_id: userId }, { expired: true });
  }
}
