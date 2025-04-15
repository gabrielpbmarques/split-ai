import { Body, Controller, Post } from '@nestjs/common';
import {
  ProcessImageMessageService,
  ProcessImageMessageDto,
} from './process-image-message.service';

interface TestImageDto {
  imageUrl: string;
  imageType?: 'profile' | 'document_front' | 'document_back' | 'selfie';
}

@Controller('test')
export class ProcessImageTestController {
  constructor(
    private readonly processImageMessageService: ProcessImageMessageService,
  ) {}

  @Post('process-image')
  async processImage(@Body() dto: TestImageDto): Promise<{ s3Url: string }> {
    const processDto: ProcessImageMessageDto = {
      imageUrl: dto.imageUrl,
      sessionId: 'test-session-' + Date.now(),
      imageType: dto.imageType || 'profile',
    };

    const s3Url = await this.processImageMessageService.execute(processDto);
    return { s3Url };
  }
}
