import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { Public } from 'src/shared/decorators/public.decorator';

@Controller('health')
export class HealthLiveController {
  @Get('live')
  @Public()
  async handle(@Res() res: FastifyReply): Promise<FastifyReply> {
    return res.status(200).send({ status: 'ok', uptime: process.uptime() });
  }
}
