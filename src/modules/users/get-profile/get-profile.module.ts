import { Module } from '@nestjs/common';

import { GetProfileController } from 'src/modules/users/get-profile/get-profile.controller';
import { GetProfileService } from 'src/modules/users/get-profile/get-profile.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [UserRepositoryModule],
  controllers: [GetProfileController],
  providers: [GetProfileService],
  exports: [GetProfileService],
})
export class GetProfileModule {}
