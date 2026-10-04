import { Module } from '@nestjs/common';

import {
  GcpStorageProvider,
  GCP_STORAGE_SERVICE,
} from './gcp-storage.provider';

@Module({
  providers: [...GcpStorageProvider],
  exports: [GCP_STORAGE_SERVICE],
})
export class GcpStorageProviderModule {}
