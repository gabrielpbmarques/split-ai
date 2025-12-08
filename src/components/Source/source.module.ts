import { Module } from '@nestjs/common';

import { DeleteSourceModule } from './DeleteSource/delete-source.module';
import { GetSourceModule } from './GetSource/get-source.module';
import { ListSourcesModule } from './ListSources/list-sources.module';

@Module({
  imports: [ListSourcesModule, GetSourceModule, DeleteSourceModule],
})
export class SourceModule {}
