import { Module } from '@nestjs/common';
import { UpdateUserService } from 'src/components/UserManagement/UpdateUser/update-user.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdateUserService],
  exports: [UpdateUserService],
})
export class UpdateUserModule {}
