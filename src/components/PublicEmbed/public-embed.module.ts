import { Module } from '@nestjs/common';

import { PublicEmbedController } from './public-embed.controller';
import { PublicEmbedService } from './public-embed.service';

@Module({
  controllers: [PublicEmbedController],
  providers: [PublicEmbedService],
  exports: [PublicEmbedService],
})
export class PublicEmbedModule {}
