import { Module } from '@nestjs/common';

import { GetEmbedScriptController } from 'src/modules/organizations/get-embed-script/get-embed-script.controller';
import { GetEmbedScriptService } from 'src/modules/organizations/get-embed-script/get-embed-script.service';

@Module({
  controllers: [GetEmbedScriptController],
  providers: [GetEmbedScriptService],
  exports: [GetEmbedScriptService],
})
export class GetEmbedScriptModule {}
