import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

import { UserTokenEntity } from 'src/infrastructure/database/schema/user-token.entity';

@Injectable()
export class UserTokenRepository {
  constructor(
    @InjectRepository(UserTokenEntity)
    private userTokenRepository: Repository<UserTokenEntity>,
  ) {}

  async create(data: Partial<UserTokenEntity>): Promise<UserTokenEntity> {
    const userToken = this.userTokenRepository.create(data);
    return this.userTokenRepository.save(userToken);
  }

  async findActiveByUserId(userId: string): Promise<UserTokenEntity[]> {
    return this.userTokenRepository.find({
      where: {
        user_id: userId,
        status: 'active',
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByToken(token: string): Promise<UserTokenEntity | null> {
    return this.userTokenRepository.findOne({
      where: {
        token,
        status: 'active',
      },
    });
  }

  async deactivateAllUserTokens(userId: string): Promise<void> {
    await this.userTokenRepository.update(
      {
        user_id: userId,
        status: 'active',
      },
      {
        status: 'inactive',
      },
    );
  }

  async deactivateToken(token: string): Promise<void> {
    await this.userTokenRepository.update(
      {
        token,
        status: 'active',
      },
      {
        status: 'inactive',
      },
    );
  }

  async createUniqueToken(
    data: Partial<UserTokenEntity>,
  ): Promise<UserTokenEntity> {
    if (data.user_id) {
      await this.deactivateAllUserTokens(data.user_id);
    }

    const userToken = this.userTokenRepository.create(data);
    return this.userTokenRepository.save(userToken);
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.userTokenRepository.update(
      {
        status: 'active',
        expires_at: LessThan(new Date()),
      },
      {
        status: 'inactive',
      },
    );
  }

  async isTokenValid(token: string): Promise<boolean> {
    const tokenEntity = await this.findByToken(token);

    if (!tokenEntity) {
      return false;
    }

    if (tokenEntity.expires_at < new Date()) {
      await this.deactivateToken(token);
      return false;
    }

    return true;
  }
}
