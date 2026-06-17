import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { ExtractDocumentDataDto } from './extract-document-data.dto';
import { ExtractDocumentDataService } from './extract-document-data.service';

@Controller('chat')
export class ExtractDocumentDataController {
  constructor(
    private readonly extractDocumentDataService: ExtractDocumentDataService,
  ) {}

  @Post('extract-document-data')
  @UseGuards(AuthGuard)
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: ExtractDocumentDataDto,
    @AuthUser() user: User,
  ) {
    try {
      const result = await this.extractDocumentDataService.execute(dto, user);

      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(500).send(error.message);
    }
  }
}
