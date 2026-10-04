import { Module } from '@nestjs/common';

import { RegisterLiteController } from 'src/modules/auth-flows/register-lite/register-lite.controller';
import { RegisterLiteService } from 'src/modules/auth-flows/register-lite/register-lite.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [RegisterLiteController],
  providers: [RegisterLiteService],
  exports: [RegisterLiteService],
})
export class RegisterLiteModule {}
