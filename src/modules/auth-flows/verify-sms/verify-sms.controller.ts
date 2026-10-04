import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FastifyReply } from 'fastify';

import { VerifySmsDto } from 'src/modules/auth-flows/verify-sms/verify-sms.dto';
import { VerifySmsService } from 'src/modules/auth-flows/verify-sms/verify-sms.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('auth-flows')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class VerifySmsController {
  constructor(private readonly verifySmsService: VerifySmsService) {}

  @Post('verify-sms')
  @Public()
  @ApiOkResponse()
  async handle(
    @Body() dto: VerifySmsDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const result = await this.verifySmsService.execute(dto);
    return res.status(200).send(result);
  }
}
