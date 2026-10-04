import { Module } from '@nestjs/common';

import { UpdateMemberRoleController } from 'src/modules/members/update-member-role/update-member-role.controller';
import { UpdateMemberRoleService } from 'src/modules/members/update-member-role/update-member-role.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [UpdateMemberRoleController],
  providers: [UpdateMemberRoleService],
  exports: [UpdateMemberRoleService],
})
export class UpdateMemberRoleModule {}
