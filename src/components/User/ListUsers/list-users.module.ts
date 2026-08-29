import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { ListUsersController } from './list-users.controller';
import { ListUsersService } from './list-users.service';

@Module({
  imports: [UserRepositoryModule],
  providers: [ListUsersService],
  controllers: [ListUsersController],
  exports: [ListUsersService],
})
export class ListUsersModule {}
