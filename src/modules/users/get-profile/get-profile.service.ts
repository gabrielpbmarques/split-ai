import { Injectable, NotFoundException } from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class GetProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserEntity> {
    // `findById` already returns a safe projection (no password/invite hashes).
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }
}
