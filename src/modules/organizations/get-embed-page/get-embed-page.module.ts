import { Module } from '@nestjs/common';

import { GetEmbedPageController } from 'src/modules/organizations/get-embed-page/get-embed-page.controller';
import { GetEmbedPageService } from 'src/modules/organizations/get-embed-page/get-embed-page.service';

@Module({
  controllers: [GetEmbedPageController],
  providers: [GetEmbedPageService],
  exports: [GetEmbedPageService],
})
export class GetEmbedPageModule {}
