import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { GetUserController } from './get-user.controller';
import { GetUserService } from './get-user.service';

@Module({
  imports: [UserRepositoryModule],
  providers: [GetUserService],
  controllers: [GetUserController],
  exports: [GetUserService],
})
export class GetUserModule {}
