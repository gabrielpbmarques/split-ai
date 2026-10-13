import { Module } from '@nestjs/common';

import { ResolveMemorySourcesService } from 'src/modules/agent-runtime/resolve-memory-sources/resolve-memory-sources.service';

@Module({
  providers: [ResolveMemorySourcesService],
  exports: [ResolveMemorySourcesService],
})
export class ResolveMemorySourcesModule {}
