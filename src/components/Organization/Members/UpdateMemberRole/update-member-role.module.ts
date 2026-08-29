import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { UpdateMemberRoleController } from './update-member-role.controller';
import { UpdateMemberRoleService } from './update-member-role.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [UpdateMemberRoleController],
  providers: [UpdateMemberRoleService],
  exports: [UpdateMemberRoleService],
})
export class UpdateMemberRoleModule {}
