import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from 'src/auth/auth.guard';
import { env } from 'src/shared/config/env';

import { StripeWebhookService } from './stripe-webhook.service';

@Controller('payment')
export class StripeWebhookController {
  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post('webhook')
  @Public()
  async handle(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<FastifyRequest>,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    if (!signature) {
      throw new BadRequestException('Cabeçalho stripe-signature ausente');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Corpo da requisição ausente');
    }

    await this.stripeWebhookService.execute(
      signature,
      req.rawBody.toString(),
      env.STRIPE_WEBHOOK_SECRET,
    );

    return res.status(200).send({ received: true });
  }
}
