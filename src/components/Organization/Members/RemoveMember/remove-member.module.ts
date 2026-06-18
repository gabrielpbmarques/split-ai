import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { RemoveMemberController } from './remove-member.controller';
import { RemoveMemberService } from './remove-member.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [RemoveMemberController],
  providers: [RemoveMemberService],
  exports: [RemoveMemberService],
})
export class RemoveMemberModule {}
