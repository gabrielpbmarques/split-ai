import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { SignUpController } from './sign-up.controller';
import { SignUpService } from './sign-up.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [SignUpController],
  providers: [SignUpService],
  exports: [SignUpService],
})
export class SignUpModule {}
