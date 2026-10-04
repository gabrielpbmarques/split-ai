import { Module } from '@nestjs/common';

import { AcceptInviteModule } from 'src/modules/members/accept-invite/accept-invite.module';
import { InviteMemberModule } from 'src/modules/members/invite-member/invite-member.module';
import { ListMembersModule } from 'src/modules/members/list-members/list-members.module';
import { RemoveMemberModule } from 'src/modules/members/remove-member/remove-member.module';
import { UpdateMemberRoleModule } from 'src/modules/members/update-member-role/update-member-role.module';

@Module({
  imports: [
    AcceptInviteModule,
    InviteMemberModule,
    ListMembersModule,
    RemoveMemberModule,
    UpdateMemberRoleModule,
  ],
  exports: [
    AcceptInviteModule,
    InviteMemberModule,
    ListMembersModule,
    RemoveMemberModule,
    UpdateMemberRoleModule,
  ],
})
export class MembersModule {}
