import { Module } from '@nestjs/common';

import { ListMembersController } from 'src/modules/members/list-members/list-members.controller';
import { ListMembersService } from 'src/modules/members/list-members/list-members.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [ListMembersController],
  providers: [ListMembersService],
  exports: [ListMembersService],
})
export class ListMembersModule {}
