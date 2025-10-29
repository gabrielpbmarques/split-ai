import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserRepository } from 'src/repositories';

import { SignUpDto, UserType } from './sign-up.dto';

@Injectable()
export class SignUpService {
  constructor(private userRepository: UserRepository) {}

  async execute(
    signUpDto: SignUpDto,
  ): Promise<{ message: string; user?: any }> {
    const { email, password, confirmPassword, ...userData } = signUpDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.create({
      name: userData.name,
      email,
      password_hash: hashedPassword,
      phone: userData.phone,
      role: UserType.USER,
      organization_id: userData.organization,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      message:
        'Cadastro realizado com sucesso! Sua conta está ativa e pronta para uso.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  }
}
