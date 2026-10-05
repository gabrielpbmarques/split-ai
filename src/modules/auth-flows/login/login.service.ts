import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';

import type { UserEntity } from 'src/infrastructure/database/schema';
import { GenerateTokenService } from 'src/modules/auth-flows/generate-token/generate-token.service';
import type { LoginDto } from 'src/modules/auth-flows/login/login.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

export interface LoginResult {
  user: Pick<UserEntity, 'id' | 'name' | 'email' | 'role' | 'phone'>;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly generateTokenService: GenerateTokenService,
  ) {}

  async execute(loginDto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'active') {
      throw new BadRequestException(
        'Usuário não está ativo. Peça ao administrador para ativar sua conta.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { token, expiresAt } = await this.generateTokenService.execute(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
      expiresAt,
    };
  }
}
