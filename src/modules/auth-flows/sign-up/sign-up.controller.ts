import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { SignUpDto } from 'src/modules/auth-flows/sign-up/sign-up.dto';
import { SignUpService } from 'src/modules/auth-flows/sign-up/sign-up.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('auth-flows')
@Controller('sign-up')
export class SignUpController {
  constructor(private readonly signUpService: SignUpService) {}

  @Post()
  @Public()
  @ApiCreatedResponse()
  async handle(@Body() signUpDto: SignUpDto, @Res() res: FastifyReply) {
    const result = await this.signUpService.execute(signUpDto);
    return res.status(201).send(result);
  }
}
