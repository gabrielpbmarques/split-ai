import { Module } from '@nestjs/common';
import { CreateUserModule } from 'src/components/UserManagement/CreateUser/create-user.module';
import { UpdateUserModule } from 'src/components/UserManagement/UpdateUser/update-user.module';
import { VerifyExistingUserModule } from 'src/components/UserManagement/VerifyExistingUser/verify-existing-user.module';

@Module({
  imports: [CreateUserModule, UpdateUserModule, VerifyExistingUserModule],
  exports: [CreateUserModule, UpdateUserModule, VerifyExistingUserModule],
})
export class UserManagementModule {}
