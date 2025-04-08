import { Module } from '@nestjs/common';
import { LoadVectorStoreService } from './load-vector-store.service';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [LoadVectorStoreService],
  exports: [LoadVectorStoreService],
})
export class LoadVectorStoreModule {}
