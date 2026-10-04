import { Module } from '@nestjs/common';

import { CreateUserModule } from 'src/modules/users/create-user/create-user.module';
import { GetProfileModule } from 'src/modules/users/get-profile/get-profile.module';
import { GetUserModule } from 'src/modules/users/get-user/get-user.module';
import { ListUsersModule } from 'src/modules/users/list-users/list-users.module';
import { UpdateProfileModule } from 'src/modules/users/update-profile/update-profile.module';
import { UpdateUserModule } from 'src/modules/users/update-user/update-user.module';

@Module({
  imports: [
    CreateUserModule,
    GetProfileModule,
    GetUserModule,
    ListUsersModule,
    UpdateProfileModule,
    UpdateUserModule,
  ],
  exports: [
    CreateUserModule,
    GetProfileModule,
    GetUserModule,
    ListUsersModule,
    UpdateProfileModule,
    UpdateUserModule,
  ],
})
export class UsersModule {}
