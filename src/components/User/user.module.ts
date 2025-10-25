import { Module } from '@nestjs/common';

import { GetUserModule } from './GetUser/get-user.module';
import { ListUsersModule } from './ListUsers/list-users.module';
import { UpdateUserModule } from './UpdateUser/update-user.module';

@Module({
  imports: [ListUsersModule, GetUserModule, UpdateUserModule],
  exports: [ListUsersModule, GetUserModule, UpdateUserModule],
})
export class UserModule {}
