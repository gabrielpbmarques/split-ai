import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { SignUpController } from './sign-up.controller';
import { SignUpService } from './sign-up.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [SignUpController],
  providers: [SignUpService],
  exports: [SignUpService],
})
export class SignUpModule {}
