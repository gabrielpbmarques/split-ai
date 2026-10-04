import { Module } from '@nestjs/common';

import { ListUsersController } from 'src/modules/users/list-users/list-users.controller';
import { ListUsersService } from 'src/modules/users/list-users/list-users.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  providers: [ListUsersService],
  controllers: [ListUsersController],
  exports: [ListUsersService],
})
export class ListUsersModule {}
