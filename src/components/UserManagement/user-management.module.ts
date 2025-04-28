import { Module } from '@nestjs/common';
import { CreateUserModule } from './CreateUser/create-user.module';
import { UpdateUserModule } from './UpdateUser/update-user.module';
import { VerifyExistingUserModule } from './VerifyExistingUser/verify-existing-user.module';

@Module({
  imports: [CreateUserModule, UpdateUserModule, VerifyExistingUserModule],
  exports: [CreateUserModule, UpdateUserModule, VerifyExistingUserModule],
})
export class UserManagementModule {}
