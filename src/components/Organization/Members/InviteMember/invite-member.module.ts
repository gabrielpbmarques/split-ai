import { Module } from '@nestjs/common';
import { EmailModule } from 'src/components/Email/email.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { InviteMemberController } from './invite-member.controller';
import { InviteMemberService } from './invite-member.service';

@Module({
  imports: [EmailModule, OrganizationRepositoryModule, UserRepositoryModule],
  controllers: [InviteMemberController],
  providers: [InviteMemberService],
  exports: [InviteMemberService],
})
export class InviteMemberModule {}
