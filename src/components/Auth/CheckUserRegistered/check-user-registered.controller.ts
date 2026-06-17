import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { CheckUserRegisteredService } from './check-user-registered.service';

@Controller('auth')
export class CheckUserRegisteredController {
  constructor(
    private readonly checkUserRegisteredService: CheckUserRegisteredService,
  ) {}

  @Post('check-user-registered')
  async handle(@Res() res: FastifyReply, @Body() body: { phone: string }) {
    try {
      const result = await this.checkUserRegisteredService.execute(body.phone);

      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }
}
