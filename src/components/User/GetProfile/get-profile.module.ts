import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetProfileController } from './get-profile.controller';
import { GetProfileService } from './get-profile.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [GetProfileController],
  providers: [GetProfileService],
  exports: [GetProfileService],
})
export class GetProfileModule {}
