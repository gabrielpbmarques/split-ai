import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateUserController } from './create-user.controller';
import { CreateUserService } from './create-user.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [CreateUserController],
  providers: [CreateUserService],
  exports: [CreateUserService],
})
export class CreateUserModule {}
