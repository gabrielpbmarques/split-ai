import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  GcpStorageProvider,
  GCP_STORAGE_SERVICE,
} from './gcp-storage.provider';

@Module({
  imports: [ConfigModule],
  providers: [...GcpStorageProvider],
  exports: [GCP_STORAGE_SERVICE],
})
export class GcpStorageProviderModule {}
