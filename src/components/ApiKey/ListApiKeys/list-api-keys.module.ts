import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListApiKeysController } from './list-api-keys.controller';
import { ListApiKeysService } from './list-api-keys.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [ListApiKeysController],
  providers: [ListApiKeysService],
  exports: [ListApiKeysService],
})
export class ListApiKeysModule {}
