import { Module } from '@nestjs/common';
import { CreateUserService } from 'src/components/UserManagement/CreateUser/create-user.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [CreateUserService],
  exports: [CreateUserService],
})
export class CreateUserModule {}
