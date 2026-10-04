import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/shared/decorators/public.decorator';

import { CheckUserRegisteredService } from './check-user-registered.service';

@Controller('auth')
export class CheckUserRegisteredController {
  constructor(
    private readonly checkUserRegisteredService: CheckUserRegisteredService,
  ) {}

  @Post('check-user-registered')
  @Public()
  async handle(@Res() res: FastifyReply, @Body() body: { phone: string }) {
    const result = await this.checkUserRegisteredService.execute(body.phone);

    return res.status(200).send({
      success: true,
      data: result,
    });
  }
}
