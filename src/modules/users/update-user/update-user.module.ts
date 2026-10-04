import { Module } from '@nestjs/common';

import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';
import { UpdateUserController } from 'src/modules/users/update-user/update-user.controller';
import { UpdateUserService } from 'src/modules/users/update-user/update-user.service';

@Module({
  imports: [UserRepositoryModule],
  providers: [UpdateUserService],
  controllers: [UpdateUserController],
  exports: [UpdateUserService],
})
export class UpdateUserModule {}
