import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { CheckUserRegisteredController } from './check-user-registered.controller';
import { CheckUserRegisteredService } from './check-user-registered.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [CheckUserRegisteredController],
  providers: [CheckUserRegisteredService],
  exports: [CheckUserRegisteredService],
})
export class CheckUserRegisteredModule {}
