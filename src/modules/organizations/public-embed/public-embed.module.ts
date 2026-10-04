import { Module } from '@nestjs/common';

import { PublicEmbedController } from 'src/modules/organizations/public-embed/public-embed.controller';
import { PublicEmbedService } from 'src/modules/organizations/public-embed/public-embed.service';

@Module({
  controllers: [PublicEmbedController],
  providers: [PublicEmbedService],
  exports: [PublicEmbedService],
})
export class PublicEmbedModule {}
