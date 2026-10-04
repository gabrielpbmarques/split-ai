import { Controller, Post, Body, ValidationPipe, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/shared/decorators/public.decorator';

import { SignUpDto } from './sign-up.dto';
import { SignUpService } from './sign-up.service';

@Controller('sign-up')
export class SignUpController {
  constructor(private readonly signUpService: SignUpService) {}

  @Post()
  @Public()
  async handle(
    @Body(new ValidationPipe()) signUpDto: SignUpDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.signUpService.execute(signUpDto);
    return res.status(200).send(result);
  }
}
