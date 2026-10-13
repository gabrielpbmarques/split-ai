import { Module } from '@nestjs/common';

import { GetProfileModule } from 'src/modules/users/get-profile/get-profile.module';
import { GetUserModule } from 'src/modules/users/get-user/get-user.module';
import { ListUsersModule } from 'src/modules/users/list-users/list-users.module';

@Module({
  imports: [GetProfileModule, GetUserModule, ListUsersModule],
  exports: [GetProfileModule, GetUserModule, ListUsersModule],
})
export class UsersModule {}
