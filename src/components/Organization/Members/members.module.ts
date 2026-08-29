import { Module } from '@nestjs/common';

import { AcceptInviteModule } from './AcceptInvite/accept-invite.module';
import { InviteMemberModule } from './InviteMember/invite-member.module';
import { ListMembersModule } from './ListMembers/list-members.module';
import { RemoveMemberModule } from './RemoveMember/remove-member.module';
import { UpdateMemberRoleModule } from './UpdateMemberRole/update-member-role.module';

@Module({
  imports: [
    InviteMemberModule,
    AcceptInviteModule,
    ListMembersModule,
    UpdateMemberRoleModule,
    RemoveMemberModule,
  ],
})
export class MembersModule {}
