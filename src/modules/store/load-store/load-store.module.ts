import { Module } from '@nestjs/common';

import { LoadStoreService } from 'src/modules/store/load-store/load-store.service';

@Module({
  providers: [LoadStoreService],
  exports: [LoadStoreService],
})
export class LoadStoreModule {}
