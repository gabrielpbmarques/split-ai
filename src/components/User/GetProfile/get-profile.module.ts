import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { GetProfileController } from './get-profile.controller';
import { GetProfileService } from './get-profile.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [GetProfileController],
  providers: [GetProfileService],
  exports: [GetProfileService],
})
export class GetProfileModule {}
