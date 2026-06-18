import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { UpdateMemberRoleController } from './update-member-role.controller';
import { UpdateMemberRoleService } from './update-member-role.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [UpdateMemberRoleController],
  providers: [UpdateMemberRoleService],
  exports: [UpdateMemberRoleService],
})
export class UpdateMemberRoleModule {}
