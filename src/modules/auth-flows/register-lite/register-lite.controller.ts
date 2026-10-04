import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { RegisterLiteDto } from 'src/modules/auth-flows/register-lite/register-lite.dto';
import { RegisterLiteService } from 'src/modules/auth-flows/register-lite/register-lite.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('auth-flows')
@Controller('auth')
export class RegisterLiteController {
  constructor(private readonly registerLiteService: RegisterLiteService) {}

  @Post('register-lite')
  @Public()
  @ApiCreatedResponse()
  async handle(@Body() dto: RegisterLiteDto, @Res() res: FastifyReply) {
    const result = await this.registerLiteService.execute(dto);
    return res.status(201).send({ success: true, data: result });
  }
}
