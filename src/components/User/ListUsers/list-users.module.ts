import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListUsersController } from './list-users.controller';
import { ListUsersService } from './list-users.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ListUsersService],
  controllers: [ListUsersController],
  exports: [ListUsersService],
})
export class ListUsersModule {}
