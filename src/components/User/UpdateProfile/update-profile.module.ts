import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { UpdateProfileController } from './update-profile.controller';
import { UpdateProfileService } from './update-profile.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [UpdateProfileController],
  providers: [UpdateProfileService],
  exports: [UpdateProfileService],
})
export class UpdateProfileModule {}
