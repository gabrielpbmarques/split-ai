import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserRepository } from 'src/repositories';

import { CreateUserDto } from './create-user.dto';

@Injectable()
export class CreateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  async execute(dto: CreateUserDto) {
    const {
      email,
      password,
      confirmPassword,
      phone,
      role,
      organization_id,
      name,
    } = dto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Senhas não conferem');
    }

    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const cleanPhone = this.cleanPhoneNumber(phone);
    const existingByPhone = await this.userRepository.findByPhone(cleanPhone);
    if (existingByPhone) {
      throw new ConflictException('Telefone já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.create({
      name,
      email,
      phone: cleanPhone,
      password_hash: hashedPassword,
      role: role ?? 'user',
      organization_id: organization_id || null,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
      organization_id: newUser.organization_id,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };
  }
}
