import { Controller, Post, Body, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { LoginDto } from 'src/modules/auth-flows/login/login.dto';
import { LoginService } from 'src/modules/auth-flows/login/login.service';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @Public()
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.loginService.execute(loginDto);
    return res.status(200).send(result);
  }
}
