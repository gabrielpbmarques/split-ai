import { Injectable } from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class ListUsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserEntity[]> {
    const users = await this.userRepository.findAll();
    return users;
  }
}
