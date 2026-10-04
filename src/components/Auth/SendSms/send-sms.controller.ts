import {
  Controller,
  Post,
  Body,
  Res,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FastifyReply } from 'fastify';

import { SendSmsDto, VerifySmsDto } from './send-sms.dto';
import { SendSmsService } from './send-sms.service';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class SendSmsController {
  constructor(private readonly sendSmsService: SendSmsService) {}

  @Post('send-sms')
  async sendSms(
    @Body(new ValidationPipe()) sendSmsDto: SendSmsDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.sendSmsService.execute(sendSmsDto);
    return res.status(200).send(result);
  }

  @Post('verify-sms')
  async verifySms(
    @Body(new ValidationPipe()) verifySmsDto: VerifySmsDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.sendSmsService.verify(verifySmsDto);
    return res.status(200).send(result);
  }
}
