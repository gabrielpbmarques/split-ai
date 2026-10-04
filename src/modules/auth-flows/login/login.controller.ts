import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { LoginDto } from 'src/modules/auth-flows/login/login.dto';
import { LoginService } from 'src/modules/auth-flows/login/login.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('auth-flows')
@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @Public()
  @ApiOkResponse()
  async handle(@Body() loginDto: LoginDto, @Res() res: FastifyReply) {
    const result = await this.loginService.execute(loginDto);
    return res.status(200).send(result);
  }
}
