import { Injectable } from '@nestjs/common';

import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class CheckUserRegisteredService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    phone: string,
  ): Promise<{ exists: boolean; userId?: string; name?: string }> {
    const cleanPhone = phone.replace(/\D/g, '');
    const user = await this.userRepository.findByPhone(cleanPhone);

    if (!user) {
      return { exists: false };
    }

    return { exists: true, userId: user.id, name: user.name };
  }
}
