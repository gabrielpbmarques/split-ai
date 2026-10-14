import { Module } from '@nestjs/common';

import { ResolveMemorySourcesService } from 'src/modules/agent-runtime/resolve-memory-sources/resolve-memory-sources.service';
import { LoadStoreModule } from 'src/modules/store/load-store/load-store.module';

@Module({
  imports: [LoadStoreModule],
  providers: [ResolveMemorySourcesService],
  exports: [ResolveMemorySourcesService],
})
export class ResolveMemorySourcesModule {}
