import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/shared/decorators/public.decorator';

import { GetPlansService } from './get-plans.service';

@Controller('payment')
export class GetPlansController {
  constructor(private readonly getPlansService: GetPlansService) {}

  @Get('plans')
  @Public()
  async handle(@Res() res: FastifyReply) {
    const plans = await this.getPlansService.execute();
    return res.status(200).send(plans);
  }
}
