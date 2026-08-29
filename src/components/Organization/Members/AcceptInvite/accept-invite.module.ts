import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { AcceptInviteController } from './accept-invite.controller';
import { AcceptInviteService } from './accept-invite.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [AcceptInviteController],
  providers: [AcceptInviteService],
  exports: [AcceptInviteService],
})
export class AcceptInviteModule {}
