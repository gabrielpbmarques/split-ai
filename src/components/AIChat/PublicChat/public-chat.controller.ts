import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/auth/auth.guard';

import {
  PublicChatMessageDto,
  PublicCreateSessionDto,
} from './public-chat.dto';
import { PublicChatService } from './public-chat.service';

@Controller('public/chat')
export class PublicChatController {
  constructor(private readonly service: PublicChatService) {}

  @Post('session')
  @Public()
  async createSession(
    @Body() dto: PublicCreateSessionDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.service.createSession(dto);
      return res.status(200).send(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .send({ message: error.message || 'Erro ao criar sessão pública' });
    }
  }

  @Post('message')
  @Public()
  async sendMessage(
    @Body() dto: PublicChatMessageDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.service.sendMessage(dto);
      return res.status(200).send(result.response);
    } catch (error) {
      return res
        .status(error.status || 500)
        .send({ message: error.message || 'Erro ao enviar mensagem pública' });
    }
  }
}
