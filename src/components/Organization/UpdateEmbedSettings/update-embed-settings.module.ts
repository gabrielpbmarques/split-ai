import { Module } from '@nestjs/common';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { UpdateEmbedSettingsController } from './update-embed-settings.controller';
import { UpdateEmbedSettingsService } from './update-embed-settings.service';

@Module({
  imports: [OrganizationRepositoryModule],
  controllers: [UpdateEmbedSettingsController],
  providers: [UpdateEmbedSettingsService],
  exports: [UpdateEmbedSettingsService],
})
export class UpdateEmbedSettingsModule {}
