import { Body, Controller, Post } from '@nestjs/common';
import { WhatsappMessageService } from 'src/components/Register/WhatsappMessage/whatsapp-message.service';
import { WhatsappMessageDto } from 'src/components/Register/WhatsappMessage/whatsapp-message.dto';

@Controller('whatsapp')
export class WhatsappMessageController {
  constructor(
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  @Post('message')
  async execute(@Body() whatsappMessageDto: WhatsappMessageDto) {
    return this.whatsappMessageService.execute(whatsappMessageDto);
  }
}
