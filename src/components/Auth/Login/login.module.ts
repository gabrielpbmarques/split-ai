import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GenerateTokenModule } from '../GenerateToken/generate-token.module';

import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [GenerateTokenModule, RepositoriesModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
