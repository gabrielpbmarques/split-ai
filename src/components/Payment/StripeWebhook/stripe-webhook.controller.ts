import { Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from 'src/auth/auth.guard';
import { config } from 'src/config';

import { StripeWebhookService } from './stripe-webhook.service';

@Controller('payment')
export class StripeWebhookController {
  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post('webhook')
  @Public()
  async handle(
    @Headers('stripe-signature') signature: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      if (!signature) {
        return res.status(400).send('Missing stripe-signature header');
      }

      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        return res.status(400).send('Missing raw body');
      }

      await this.stripeWebhookService.execute(
        signature,
        rawBody.toString(),
        config.stripeWebhookSecret,
      );

      return res.status(200).send({ received: true });
    } catch (error) {
      const status = (error && (error.status || error.statusCode)) || 400;
      return res
        .status(status)
        .send(error.message || 'Webhook processing failed');
    }
  }
}
