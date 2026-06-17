import { Controller, Post, Body, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { LoginDto } from './login.dto';
import { LoginService } from './login.service';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.loginService.execute(loginDto);
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
