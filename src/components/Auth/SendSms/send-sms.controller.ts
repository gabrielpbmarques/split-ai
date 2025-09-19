import { Controller, Post, Body, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { SendSmsDto, VerifySmsDto } from './send-sms.dto';
import { SendSmsService } from './send-sms.service';

@Controller('auth')
export class SendSmsController {
  constructor(private readonly sendSmsService: SendSmsService) {}

  @Post('send-sms')
  async sendSms(
    @Body(new ValidationPipe()) sendSmsDto: SendSmsDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.sendSmsService.execute(sendSmsDto);
      return res.status(200).send(result);
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }

  @Post('verify-sms')
  async verifySms(
    @Body(new ValidationPipe()) verifySmsDto: VerifySmsDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.sendSmsService.verify(verifySmsDto);
      return res.status(200).send(result);
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
