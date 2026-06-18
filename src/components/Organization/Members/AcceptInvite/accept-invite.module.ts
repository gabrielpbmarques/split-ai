import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { AcceptInviteController } from './accept-invite.controller';
import { AcceptInviteService } from './accept-invite.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [AcceptInviteController],
  providers: [AcceptInviteService],
  exports: [AcceptInviteService],
})
export class AcceptInviteModule {}
