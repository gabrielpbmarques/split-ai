import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Roles } from 'src/decorators/roles.decorator';

import { GenerateAgentSourceDto } from './generate-agent-source.dto';
import { GenerateAgentSourceService } from './generate-agent-source.service';

@Controller('agent')
export class GenerateAgentSourceController {
  constructor(
    private readonly generateAgentSourceService: GenerateAgentSourceService,
  ) {}

  @Post('generate-source')
  @Roles('admin')
  async execute(
    @Body() generateAgentSourceDto: GenerateAgentSourceDto,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const body: any = (req as any).body || {};

      const file = body.file;
      const hasFile = file && typeof file.toBuffer === 'function';
      const buffer: Buffer | undefined = hasFile
        ? await file.toBuffer()
        : undefined;

      const sourceType: string | undefined = hasFile
        ? body.sourceType?.value || undefined
        : generateAgentSourceDto.sourceType;

      const agentId: string | undefined = hasFile
        ? body.agentId?.value || undefined
        : generateAgentSourceDto.agentId;

      const url: string | undefined = hasFile
        ? body.url?.value || undefined
        : generateAgentSourceDto.url;

      if (!buffer && (!url || !url.trim())) {
        return res
          .status(400)
          .send('Informe ao menos uma URL (url) ou um arquivo (file)');
      }

      await this.generateAgentSourceService.execute({
        url,
        buffer,
        sourceType,
        agentId,
      });

      return res
        .status(200)
        .send({ message: 'Fonte de conhecimento processada com sucesso' });
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
