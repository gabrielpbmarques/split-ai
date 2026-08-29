import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { GenerateTokenModule } from '../GenerateToken/generate-token.module';

import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [GenerateTokenModule, UserRepositoryModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
