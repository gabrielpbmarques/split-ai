import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetEmbedPageService } from 'src/modules/organizations/get-embed-page/get-embed-page.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('organizations')
@Controller('public/embed')
export class GetEmbedPageController {
  constructor(private readonly getEmbedPageService: GetEmbedPageService) {}

  @Get('chat')
  @Public()
  @ApiOkResponse()
  async handle(@Res() res: FastifyReply): Promise<FastifyReply> {
    return res
      .status(200)
      .header('Content-Type', 'text/html; charset=utf-8')
      .send(this.getEmbedPageService.execute());
  }
}
