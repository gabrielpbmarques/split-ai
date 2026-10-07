import { Module } from '@nestjs/common';

import { RecordInterruptedSourcesService } from 'src/modules/sources/record-interrupted-sources/record-interrupted-sources.service';
import { SourceRepositoryModule } from 'src/modules/sources/repositories/source.repository.module';

@Module({
  imports: [SourceRepositoryModule],
  providers: [RecordInterruptedSourcesService],
  exports: [RecordInterruptedSourcesService],
})
export class RecordInterruptedSourcesModule {}
