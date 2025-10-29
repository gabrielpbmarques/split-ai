import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { UpdateUserController } from './update-user.controller';
import { UpdateUserService } from './update-user.service';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdateUserService],
  controllers: [UpdateUserController],
  exports: [UpdateUserService],
})
export class UpdateUserModule {}
