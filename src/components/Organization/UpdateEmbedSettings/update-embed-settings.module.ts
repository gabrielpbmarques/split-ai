import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { UpdateEmbedSettingsController } from './update-embed-settings.controller';
import { UpdateEmbedSettingsService } from './update-embed-settings.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [UpdateEmbedSettingsController],
  providers: [UpdateEmbedSettingsService],
  exports: [UpdateEmbedSettingsService],
})
export class UpdateEmbedSettingsModule {}
