import { Controller, Post, Body, Res } from '@nestjs/common';
import { DocumentValidationService } from 'src/components/Document/DocumentValidation/document-validation.service';
import { DocumentValidationMessage } from 'src/components/Document/DocumentValidation/document-validation.dto';
import { FastifyReply } from 'fastify';

@Controller('document')
export class DocumentValidationController {
  constructor(
    private readonly documentValidationService: DocumentValidationService,
  ) {}

  @Post('validate')
  async execute(
    @Body() payload: DocumentValidationMessage,
    @Res() reply: FastifyReply,
  ): Promise<any> {
    try {
      const result = await this.documentValidationService.execute(payload);

      reply.status(200).send(result);
    } catch (error) {
      reply.status(500).send(error.message);
    }
  }
}
