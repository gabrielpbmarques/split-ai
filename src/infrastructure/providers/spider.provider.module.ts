import { Module } from '@nestjs/common';

import { SpiderServiceProvider, SPIDER_SERVICE } from './spider.provider';

@Module({
  providers: [...SpiderServiceProvider],
  exports: [SPIDER_SERVICE],
})
export class SpiderProviderModule {}
