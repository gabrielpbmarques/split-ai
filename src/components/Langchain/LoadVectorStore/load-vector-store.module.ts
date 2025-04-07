import { Module } from '@nestjs/common';
import { LoadVectorStoreService } from './load-vector-store.service';

@Module({
  providers: [LoadVectorStoreService],
})
export class LoadVectorStoreModule {}
