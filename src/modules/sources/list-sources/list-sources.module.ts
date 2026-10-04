import { Module } from '@nestjs/common';

import { ListSourcesController } from 'src/modules/sources/list-sources/list-sources.controller';
import { ListSourcesService } from 'src/modules/sources/list-sources/list-sources.service';
import { SourceRepositoryModule } from 'src/modules/sources/repositories/source.repository.module';

@Module({
  imports: [SourceRepositoryModule],
  controllers: [ListSourcesController],
  providers: [ListSourcesService],
})
export class ListSourcesModule {}
