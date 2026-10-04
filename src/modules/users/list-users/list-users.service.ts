import { Injectable } from '@nestjs/common';

import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class ListUsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute() {
    const users = await this.userRepository.findAll();
    return users;
  }
}
