import { Module } from '@nestjs/common';
import { EmailModule } from 'src/components/Email/email.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { InviteMemberController } from './invite-member.controller';
import { InviteMemberService } from './invite-member.service';

@Module({
  imports: [RepositoriesModule, EmailModule],
  controllers: [InviteMemberController],
  providers: [InviteMemberService],
  exports: [InviteMemberService],
})
export class InviteMemberModule {}
