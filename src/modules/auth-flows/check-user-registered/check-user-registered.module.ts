import { Module } from '@nestjs/common';

import { CheckUserRegisteredController } from 'src/modules/auth-flows/check-user-registered/check-user-registered.controller';
import { CheckUserRegisteredService } from 'src/modules/auth-flows/check-user-registered/check-user-registered.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [CheckUserRegisteredController],
  providers: [CheckUserRegisteredService],
  exports: [CheckUserRegisteredService],
})
export class CheckUserRegisteredModule {}
