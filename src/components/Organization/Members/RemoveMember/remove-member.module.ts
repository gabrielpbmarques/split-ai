import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { RemoveMemberController } from './remove-member.controller';
import { RemoveMemberService } from './remove-member.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [RemoveMemberController],
  providers: [RemoveMemberService],
  exports: [RemoveMemberService],
})
export class RemoveMemberModule {}
