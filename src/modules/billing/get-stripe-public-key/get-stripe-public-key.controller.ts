import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { GetStripePublicKeyService } from 'src/modules/billing/get-stripe-public-key/get-stripe-public-key.service';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('payment')
export class GetStripePublicKeyController {
  constructor(
    private readonly getStripePublicKeyService: GetStripePublicKeyService,
  ) {}

  @Get('stripe-public-key')
  @Public()
  async handle(@Res() res: FastifyReply) {
    const data = await this.getStripePublicKeyService.execute();
    return res.status(200).send(data);
  }
}
