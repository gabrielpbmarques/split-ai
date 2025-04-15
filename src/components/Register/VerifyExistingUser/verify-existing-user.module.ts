import { Module } from '@nestjs/common';
import { VerifyExistingUserService } from './verify-existing-user.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [VerifyExistingUserService],
  exports: [VerifyExistingUserService],
})
export class VerifyExistingUserModule {}
