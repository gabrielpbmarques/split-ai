import { Controller, Post, Body, Res } from '@nestjs/common';
import { RegisterService } from './register.service';
import { FastifyReply } from 'fastify';
import { RegisterChatDTO } from './register.dto';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('whatsapp')
  async receberMensagem(
    @Body() payload: RegisterChatDTO,
    @Res() reply: FastifyReply,
  ) {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    });

    await this.registerService.execute(payload, (chunk) => {
      reply.raw.write(chunk.content);
    });

    reply.raw.end();
  }
}
