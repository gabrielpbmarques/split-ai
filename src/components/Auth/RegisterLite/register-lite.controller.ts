import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/shared/decorators/public.decorator';

import { RegisterLiteDto } from './register-lite.dto';
import { RegisterLiteService } from './register-lite.service';

@Controller('auth')
export class RegisterLiteController {
  constructor(private readonly registerLiteService: RegisterLiteService) {}

  @Post('register-lite')
  @Public()
  async handle(
    @Body(new ValidationPipe()) dto: RegisterLiteDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.registerLiteService.execute(dto);
    return res.status(200).send({ success: true, data: result });
  }
}
