import { Module } from '@nestjs/common';

import { InviteMemberController } from 'src/modules/members/invite-member/invite-member.controller';
import { InviteMemberService } from 'src/modules/members/invite-member/invite-member.service';
import { EmailModule } from 'src/modules/notifications/email/email.module';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [EmailModule, OrganizationRepositoryModule, UserRepositoryModule],
  controllers: [InviteMemberController],
  providers: [InviteMemberService],
  exports: [InviteMemberService],
})
export class InviteMemberModule {}
