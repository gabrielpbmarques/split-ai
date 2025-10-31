import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserRepository } from 'src/repositories';

import { GenerateTokenService } from '../GenerateToken/generate-token.service';

import { LoginDto } from './login.dto';

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly generateTokenService: GenerateTokenService,
  ) {}

  async execute(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'active') {
      throw new BadRequestException(
        'Usuário não está ativo. Complete a verificação do seu telefone para ativar sua conta.',
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
        organization_id: user.organization_id,
        role: user.role,
        phone: user.phone,
      },
      token,
      expiresAt,
    };
  }
}
