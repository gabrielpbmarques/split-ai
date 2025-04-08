import { Body, Controller, Post } from '@nestjs/common';
import { ProcessMessageService } from './process-message.service';
import { ProcessMessageDto } from './process-message.dto';

@Controller('register')
export class ProcessMessageController {
  constructor(private readonly processMessageService: ProcessMessageService) {}

  @Post('message')
  async execute(@Body() processMessageDto: ProcessMessageDto) {
    return this.processMessageService.execute(processMessageDto);
  }
}
