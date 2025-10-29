import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetUserController } from './get-user.controller';
import { GetUserService } from './get-user.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetUserService],
  controllers: [GetUserController],
  exports: [GetUserService],
})
export class GetUserModule {}
