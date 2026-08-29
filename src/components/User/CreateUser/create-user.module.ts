import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { CreateUserController } from './create-user.controller';
import { CreateUserService } from './create-user.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [CreateUserController],
  providers: [CreateUserService],
  exports: [CreateUserService],
})
export class CreateUserModule {}
