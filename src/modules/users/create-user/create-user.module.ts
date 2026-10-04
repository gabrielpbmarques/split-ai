import { Module } from '@nestjs/common';

import { CreateUserController } from 'src/modules/users/create-user/create-user.controller';
import { CreateUserService } from 'src/modules/users/create-user/create-user.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [CreateUserController],
  providers: [CreateUserService],
  exports: [CreateUserService],
})
export class CreateUserModule {}
