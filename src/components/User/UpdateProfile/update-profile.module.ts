import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { UpdateProfileController } from './update-profile.controller';
import { UpdateProfileService } from './update-profile.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [UpdateProfileController],
  providers: [UpdateProfileService],
  exports: [UpdateProfileService],
})
export class UpdateProfileModule {}
