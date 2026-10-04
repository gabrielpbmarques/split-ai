import { Module } from '@nestjs/common';

import { AcceptInviteController } from 'src/modules/members/accept-invite/accept-invite.controller';
import { AcceptInviteService } from 'src/modules/members/accept-invite/accept-invite.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [AcceptInviteController],
  providers: [AcceptInviteService],
  exports: [AcceptInviteService],
})
export class AcceptInviteModule {}
