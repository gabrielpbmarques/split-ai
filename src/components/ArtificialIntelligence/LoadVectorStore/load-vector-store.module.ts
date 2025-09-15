import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { LoadVectorStoreService } from './load-vector-store.service';

@Module({
  imports: [InfrastructureModule],
  providers: [LoadVectorStoreService],
  exports: [LoadVectorStoreService],
})
export class LoadVectorStoreModule {}
