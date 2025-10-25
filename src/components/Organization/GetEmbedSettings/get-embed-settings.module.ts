import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetEmbedSettingsController } from './get-embed-settings.controller';
import { GetEmbedSettingsService } from './get-embed-settings.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [GetEmbedSettingsController],
  providers: [GetEmbedSettingsService],
  exports: [GetEmbedSettingsService],
})
export class GetEmbedSettingsModule {}
