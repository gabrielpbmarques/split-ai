import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GenerateAgentSourceService } from 'src/modules/sources/generate-agent-source/generate-agent-source.service';
import type { AgentSource } from 'src/shared/contracts/agent-source';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

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

@ApiTags('sources')
@Controller('agent')
export class GenerateAgentSourceController {
  constructor(
    private readonly generateAgentSourceService: GenerateAgentSourceService,
  ) {}

  @Post('generate-source')
  @RequirePermissions('source.write')
  @ApiAcceptedResponse({
    description: 'Fonte recebida; o processamento continua em segundo plano',
  })
  @ApiBearerAuth()
  @ApiBadRequestResponse({
    description:
      'Sem arquivo nem URL, sem agentId ou tipo de arquivo não suportado',
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  @ApiNotFoundResponse({ description: 'Agente não encontrado' })
  async handle(
    @Res() res: FastifyReply,
    @Body() body: GenerateAgentSourceBody,
  ): Promise<FastifyReply> {
    const file =
      typeof body.file?.toBuffer === 'function' ? body.file : undefined;
    const buffer = file ? await file.toBuffer() : undefined;
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
      fileName: file?.filename || fieldValue(body, 'fileName'),
      mimeType: file?.mimetype,
    });

    return res.status(202).send({
      message:
        'Fonte de conhecimento recebida. O processamento continua em segundo plano.',
    });
  }
}
