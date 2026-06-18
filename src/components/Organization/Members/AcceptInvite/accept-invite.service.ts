import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserRepository } from 'src/repositories';
import { hashInviteToken } from 'src/utils/inviteToken';

import { AcceptInviteDto } from './accept-invite.dto';

@Injectable()
export class AcceptInviteService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: AcceptInviteDto): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (
      !user ||
      !user.invite_token_hash ||
      user.invite_token_hash !== hashInviteToken(dto.token)
    ) {
      throw new BadRequestException('Convite inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.userRepository.update(user.id, {
      password_hash: passwordHash,
      status: 'active',
      invite_token_hash: null,
    });

    return { message: 'Convite aceito com sucesso! Sua conta está ativa.' };
  }
}
