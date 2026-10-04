import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { UserEntity } from 'src/infrastructure/database/schema';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import type { UpdateProfileDto } from 'src/modules/users/update-profile/update-profile.dto';

@Injectable()
export class UpdateProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing && existing.id !== userId) {
        throw new ConflictException('E-mail já está em uso.');
      }
    }

    const patch: Partial<UserEntity> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.phone !== undefined) patch.phone = dto.phone;

    const updated = await this.userRepository.update(userId, patch);
    if (!updated) throw new NotFoundException('Usuário não encontrado');

    return updated;
  }
}
