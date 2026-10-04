import { Module } from '@nestjs/common';

import { RemoveMemberController } from 'src/modules/members/remove-member/remove-member.controller';
import { RemoveMemberService } from 'src/modules/members/remove-member/remove-member.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [RemoveMemberController],
  providers: [RemoveMemberService],
  exports: [RemoveMemberService],
})
export class RemoveMemberModule {}
