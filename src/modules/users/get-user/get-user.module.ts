import { Module } from '@nestjs/common';

import { GetUserController } from 'src/modules/users/get-user/get-user.controller';
import { GetUserService } from 'src/modules/users/get-user/get-user.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  providers: [GetUserService],
  controllers: [GetUserController],
  exports: [GetUserService],
})
export class GetUserModule {}
