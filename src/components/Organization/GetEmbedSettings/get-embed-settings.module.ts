import { Module } from '@nestjs/common';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { GetEmbedSettingsController } from './get-embed-settings.controller';
import { GetEmbedSettingsService } from './get-embed-settings.service';

@Module({
  imports: [OrganizationRepositoryModule],
  controllers: [GetEmbedSettingsController],
  providers: [GetEmbedSettingsService],
  exports: [GetEmbedSettingsService],
})
export class GetEmbedSettingsModule {}
