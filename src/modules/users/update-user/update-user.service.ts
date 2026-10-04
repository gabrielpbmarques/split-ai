import { Injectable, NotFoundException } from '@nestjs/common';

import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { UpdateUserDto } from 'src/modules/users/update-user/update-user.dto';

@Injectable()
export class UpdateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, dto: UpdateUserDto) {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updated = await this.userRepository.update(id, dto);
    return updated;
  }
}
