import { Module } from '@nestjs/common';

import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';
import { UpdateProfileController } from 'src/modules/users/update-profile/update-profile.controller';
import { UpdateProfileService } from 'src/modules/users/update-profile/update-profile.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [UpdateProfileController],
  providers: [UpdateProfileService],
  exports: [UpdateProfileService],
})
export class UpdateProfileModule {}
