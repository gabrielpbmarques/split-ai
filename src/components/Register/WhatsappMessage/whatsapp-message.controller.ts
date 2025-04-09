import { Body, Controller, Post } from '@nestjs/common';
import {
  WhatsappMessageService,
  WhatsappMessageResponse,
} from './whatsapp-message.service';
import { WhatsappMessageDto } from './whatsapp-message.dto';

@Controller('whatsapp')
export class WhatsappMessageController {
  constructor(
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  @Post('message')
  async execute(
    @Body() whatsappMessageDto: WhatsappMessageDto,
  ): Promise<WhatsappMessageResponse> {
    return this.whatsappMessageService.execute(whatsappMessageDto);
  }
}
