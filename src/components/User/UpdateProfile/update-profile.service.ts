import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from 'src/entities';
import { UserRepository } from 'src/repositories';

import { UpdateProfileDto } from './update-profile.dto';

@Injectable()
export class UpdateProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, dto: UpdateProfileDto) {
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

    // `update` returns the refreshed safe projection.
    return this.userRepository.update(userId, patch);
  }
}
