import { Module } from '@nestjs/common';

import { GenerateTokenModule } from 'src/modules/auth-flows/generate-token/generate-token.module';
import { LoginController } from 'src/modules/auth-flows/login/login.controller';
import { LoginService } from 'src/modules/auth-flows/login/login.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [GenerateTokenModule, UserRepositoryModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
