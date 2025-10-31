import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CheckUserRegisteredController } from './check-user-registered.controller';
import { CheckUserRegisteredService } from './check-user-registered.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [CheckUserRegisteredController],
  providers: [CheckUserRegisteredService],
  exports: [CheckUserRegisteredService],
})
export class CheckUserRegisteredModule {}
