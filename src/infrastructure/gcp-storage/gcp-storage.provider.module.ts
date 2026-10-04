import { Module } from '@nestjs/common';

import { GcpStorageProvider } from 'src/infrastructure/gcp-storage/gcp-storage.provider';
import { GCP_STORAGE_SERVICE } from 'src/infrastructure/gcp-storage/gcp-storage.tokens';

@Module({
  providers: [...GcpStorageProvider],
  exports: [GCP_STORAGE_SERVICE],
})
export class GcpStorageProviderModule {}
