import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/auth/auth.guard';

import { GetStripePublicKeyService } from './get-stripe-public-key.service';

@Controller('payment')
export class GetStripePublicKeyController {
  constructor(
    private readonly getStripePublicKeyService: GetStripePublicKeyService,
  ) {}

  @Get('stripe-public-key')
  @Public()
  async handle(@Res() res: FastifyReply) {
    try {
      const data = await this.getStripePublicKeyService.execute();
      return res.status(200).send(data);
    } catch (error) {
      const status = (error && (error.status || error.statusCode)) || 500;
      return res.status(status).send(error.message || 'Internal server error');
    }
  }
}
