import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  WhatsappMessageService,
  WhatsappMessageResponse,
} from './whatsapp-message.service';
import { WhatsappMessageDto } from './whatsapp-message.dto';
import { FastifyReply } from 'fastify';

@Controller('whatsapp')
export class WhatsappMessageController {
  constructor(
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  @Post('message')
  async execute(
    @Body() whatsappMessageDto: WhatsappMessageDto,
    @Res() res: FastifyReply,
  ): Promise<WhatsappMessageResponse> {
    try {
      return await this.whatsappMessageService.execute(whatsappMessageDto);
    } catch (error) {
      res.status(error.status || 500).send(error);
    }
  }
}
