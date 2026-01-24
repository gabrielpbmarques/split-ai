import { Body, Controller, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { ExtractDocumentDataDto } from './extract-document-data.dto';
import { ExtractDocumentDataService } from './extract-document-data.service';

@Controller('chat')
export class ExtractDocumentDataController {
  constructor(
    private readonly extractDocumentDataService: ExtractDocumentDataService,
  ) {}

  async handle(@Res() res: FastifyReply, @Body() dto: ExtractDocumentDataDto) {
    try {
      const result = await this.extractDocumentDataService.execute(dto);

      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
}
