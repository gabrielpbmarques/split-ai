import {
  BadRequestException,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Roles } from 'src/decorators/roles.decorator';
import { AgentSource } from 'src/types/agent-source';

import { GenerateAgentSourceService } from './generate-agent-source.service';

interface MultipartField {
  value?: string;
}

interface MultipartFile {
  filename?: string;
  mimetype?: string;
  toBuffer(): Promise<Buffer>;
}

type GenerateAgentSourceBody = Record<string, unknown> & {
  file?: MultipartFile;
};

function fieldValue(
  body: GenerateAgentSourceBody,
  name: string,
): string | undefined {
  const raw = body[name];

  if (typeof raw === 'string') {
    return raw;
  }

  const value = (raw as MultipartField | undefined)?.value;

  return typeof value === 'string' ? value : undefined;
}

@Controller('agent')
export class GenerateAgentSourceController {
  constructor(
    private readonly generateAgentSourceService: GenerateAgentSourceService,
  ) {}

  @Post('generate-source')
  @Roles('admin')
  async handle(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const body = (req.body ?? {}) as GenerateAgentSourceBody;
    const file = body.file;
    const hasFile = Boolean(file && typeof file.toBuffer === 'function');
    const buffer = hasFile ? await file.toBuffer() : undefined;
    const url = fieldValue(body, 'url');

    if (!buffer && (!url || !url.trim())) {
      throw new BadRequestException(
        'Informe ao menos uma URL (url) ou um arquivo (file)',
      );
    }

    await this.generateAgentSourceService.execute({
      url,
      buffer,
      sourceType: fieldValue(body, 'sourceType') as AgentSource | undefined,
      agentId: fieldValue(body, 'agentId'),
      fileName: hasFile
        ? file.filename || fieldValue(body, 'fileName')
        : fieldValue(body, 'fileName'),
      mimeType: hasFile ? file.mimetype : undefined,
    });

    return res
      .status(200)
      .send({ message: 'Fonte de conhecimento processada com sucesso' });
  }
}
