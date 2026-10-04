import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { WebhookService } from 'src/modules/whatsapp/webhook/webhook.service';
import { Public } from 'src/shared/decorators/public.decorator';

const TWIML_EMPTY_RESPONSE = '<Response/>';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('webhook')
  @Public()
  @ApiOkResponse()
  async handle(
    @Res() res: FastifyReply,
    @Body() body: Record<string, unknown>,
  ): Promise<FastifyReply> {
    await this.webhookService.execute(body).catch((error) => {
      this.logger.error('Falha ao processar webhook do WhatsApp', error);
    });

    return res
      .header('Content-Type', 'text/xml')
      .status(200)
      .send(TWIML_EMPTY_RESPONSE);
  }
}
