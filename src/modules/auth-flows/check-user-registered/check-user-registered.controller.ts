import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { CheckUserRegisteredService } from 'src/modules/auth-flows/check-user-registered/check-user-registered.service';
import { Public } from 'src/shared/decorators/public.decorator';

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
