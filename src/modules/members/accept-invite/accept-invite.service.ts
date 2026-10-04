import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

import type { AcceptInviteDto } from 'src/modules/members/accept-invite/accept-invite.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { hashInviteToken } from 'src/shared/utils/invite-token';

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
