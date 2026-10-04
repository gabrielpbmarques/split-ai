import { BadRequestException, Injectable } from '@nestjs/common';

import type { RegisterLiteDto } from 'src/modules/auth-flows/register-lite/register-lite.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class RegisterLiteService {
  constructor(private readonly userRepository: UserRepository) {}

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  async execute(
    dto: RegisterLiteDto,
  ): Promise<{ userId: string; name: string; phone: string }> {
    const cleanPhone = this.cleanPhoneNumber(dto.phone);

    const existingByPhone = await this.userRepository.findByPhone(cleanPhone);
    if (existingByPhone) {
      throw new BadRequestException('Telefone já cadastrado');
    }

    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      phone: cleanPhone,
      status: 'inactive',
      role: 'user',
      origin: 'app',
      organization_id: dto.organization_id ?? null,
    });

    return { userId: user.id, name: user.name, phone: user.phone };
  }
}
