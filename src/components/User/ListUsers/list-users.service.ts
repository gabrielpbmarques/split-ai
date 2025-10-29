import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories';

@Injectable()
export class ListUsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute() {
    const users = await this.userRepository.findAll();
    return users;
  }
}
