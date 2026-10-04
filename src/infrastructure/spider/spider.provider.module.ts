import { Module } from '@nestjs/common';

import { SpiderServiceProvider } from 'src/infrastructure/spider/spider.provider';
import { SPIDER_SERVICE } from 'src/infrastructure/spider/spider.tokens';

@Module({
  providers: [...SpiderServiceProvider],
  exports: [SPIDER_SERVICE],
})
export class SpiderProviderModule {}
