import { Controller, Post, Body, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { WebhookDto } from './webhook.dto';
import { WebhookService } from './webhook.service';

@Controller('whatsapp')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('webhook')
  async handle(@Res() res: FastifyReply, @Body() body: WebhookDto) {
    try {
      await this.webhookService.execute(body);
      res.header('Content-Type', 'text/xml').status(200).send('<Response/>');
    } catch (error: any) {
      res.header('Content-Type', 'text/xml').status(200).send('<Response/>');
    }
  }
}
