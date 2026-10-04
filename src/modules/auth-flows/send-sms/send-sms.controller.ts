import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FastifyReply } from 'fastify';

import { SendSmsDto } from 'src/modules/auth-flows/send-sms/send-sms.dto';
import { SendSmsService } from 'src/modules/auth-flows/send-sms/send-sms.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('auth-flows')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class SendSmsController {
  constructor(private readonly sendSmsService: SendSmsService) {}

  @Post('send-sms')
  @Public()
  @ApiOkResponse()
  async handle(
    @Body() dto: SendSmsDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const result = await this.sendSmsService.execute(dto);
    return res.status(200).send(result);
  }
}
