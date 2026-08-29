import { Module } from '@nestjs/common';
import { SourceRepositoryModule } from 'src/repositories/source.repository.module';

import { ListSourcesController } from './list-sources.controller';
import { ListSourcesService } from './list-sources.service';

@Module({
  imports: [SourceRepositoryModule],
  controllers: [ListSourcesController],
  providers: [ListSourcesService],
})
export class ListSourcesModule {}
