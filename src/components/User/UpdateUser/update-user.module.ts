import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { UpdateUserController } from './update-user.controller';
import { UpdateUserService } from './update-user.service';

@Module({
  imports: [UserRepositoryModule],
  providers: [UpdateUserService],
  controllers: [UpdateUserController],
  exports: [UpdateUserService],
})
export class UpdateUserModule {}
