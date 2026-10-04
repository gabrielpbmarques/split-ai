import { Injectable, NotFoundException } from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class GetUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
}
