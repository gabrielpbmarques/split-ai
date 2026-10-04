import { Controller, Post, Body, ValidationPipe, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { SignUpDto } from 'src/modules/auth-flows/sign-up/sign-up.dto';
import { SignUpService } from 'src/modules/auth-flows/sign-up/sign-up.service';
import { Public } from 'src/shared/decorators/public.decorator';

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
