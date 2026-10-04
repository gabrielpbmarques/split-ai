import { Module } from '@nestjs/common';

import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';
import { UpdateEmbedSettingsController } from 'src/modules/organizations/update-embed-settings/update-embed-settings.controller';
import { UpdateEmbedSettingsService } from 'src/modules/organizations/update-embed-settings/update-embed-settings.service';

@Module({
  imports: [OrganizationRepositoryModule],
  controllers: [UpdateEmbedSettingsController],
  providers: [UpdateEmbedSettingsService],
  exports: [UpdateEmbedSettingsService],
})
export class UpdateEmbedSettingsModule {}
