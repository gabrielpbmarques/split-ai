import { Module } from '@nestjs/common';

import { SignUpController } from 'src/modules/auth-flows/sign-up/sign-up.controller';
import { SignUpService } from 'src/modules/auth-flows/sign-up/sign-up.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [SignUpController],
  providers: [SignUpService],
  exports: [SignUpService],
})
export class SignUpModule {}
