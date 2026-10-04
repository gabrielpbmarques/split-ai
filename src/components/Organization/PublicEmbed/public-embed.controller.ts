import { Controller, Get, Header, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/auth/auth.guard';

import { PublicEmbedService } from './public-embed.service';

@Controller('public/embed')
export class PublicEmbedController {
  constructor(private readonly service: PublicEmbedService) {}

  @Get('chat.js')
  @Public()
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  async script(@Res() res: FastifyReply) {
    const js = this.service.getEmbedScript();
    res.raw.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(js);
  }

  @Get('chat')
  @Public()
  @Header('Content-Type', 'text/html; charset=utf-8')
  async page(@Res() res: FastifyReply) {
    const html = this.service.getEmbedChatHtml();
    return res.status(200).send(html);
  }
}
