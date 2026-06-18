import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListMembersController } from './list-members.controller';
import { ListMembersService } from './list-members.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [ListMembersController],
  providers: [ListMembersService],
  exports: [ListMembersService],
})
export class ListMembersModule {}
