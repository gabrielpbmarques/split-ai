import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetEmbedScriptService } from 'src/modules/organizations/get-embed-script/get-embed-script.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('organizations')
@Controller('public/embed')
export class GetEmbedScriptController {
  constructor(private readonly getEmbedScriptService: GetEmbedScriptService) {}

  @Get('chat.js')
  @Public()
  @ApiOkResponse()
  async handle(@Res() res: FastifyReply): Promise<FastifyReply> {
    return res
      .status(200)
      .header('Content-Type', 'application/javascript; charset=utf-8')
      .header('Cache-Control', 'public, max-age=300')
      .send(this.getEmbedScriptService.execute());
  }
}
