import { Module } from '@nestjs/common';

import { CreateUserModule } from './CreateUser/create-user.module';
import { GetProfileModule } from './GetProfile/get-profile.module';
import { GetUserModule } from './GetUser/get-user.module';
import { ListUsersModule } from './ListUsers/list-users.module';
import { UpdateProfileModule } from './UpdateProfile/update-profile.module';
import { UpdateUserModule } from './UpdateUser/update-user.module';

@Module({
  imports: [
    ListUsersModule,
    GetUserModule,
    UpdateUserModule,
    CreateUserModule,
    GetProfileModule,
    UpdateProfileModule,
  ],
  exports: [
    ListUsersModule,
    GetUserModule,
    UpdateUserModule,
    CreateUserModule,
    GetProfileModule,
    UpdateProfileModule,
  ],
})
export class UserModule {}
