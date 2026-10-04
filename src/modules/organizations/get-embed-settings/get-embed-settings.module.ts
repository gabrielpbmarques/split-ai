import { Module } from '@nestjs/common';

import { GetEmbedSettingsController } from 'src/modules/organizations/get-embed-settings/get-embed-settings.controller';
import { GetEmbedSettingsService } from 'src/modules/organizations/get-embed-settings/get-embed-settings.service';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';

@Module({
  imports: [OrganizationRepositoryModule],
  controllers: [GetEmbedSettingsController],
  providers: [GetEmbedSettingsService],
  exports: [GetEmbedSettingsService],
})
export class GetEmbedSettingsModule {}
