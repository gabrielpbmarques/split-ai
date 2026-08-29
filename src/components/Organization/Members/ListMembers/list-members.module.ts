import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { ListMembersController } from './list-members.controller';
import { ListMembersService } from './list-members.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [ListMembersController],
  providers: [ListMembersService],
  exports: [ListMembersService],
})
export class ListMembersModule {}
