import { Controller, Post, Body, Res } from '@nestjs/common';
import { RegisterService } from './register.service';
import { FastifyReply } from 'fastify';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('whatsapp')
  async receberMensagem(@Body() payload: any, @Res() res: FastifyReply) {
    const response = await this.registerService.execute(payload);
    return res.status(200).send(response);
  }
}
