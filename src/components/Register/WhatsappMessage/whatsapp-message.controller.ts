import { Body, Controller, Post, Res } from '@nestjs/common';
import { WhatsappMessageService } from 'src/components/Register/WhatsappMessage/whatsapp-message.service';
import { WhatsappMessageDto } from 'src/components/Register/WhatsappMessage/whatsapp-message.dto';
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
  ): Promise<FastifyReply> {
    try {
      const result =
        await this.whatsappMessageService.execute(whatsappMessageDto);

      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      return res.status(error.status || 500).send(error.message);
    }
  }
}
