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
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const result = await this.generateAgentSourceService.execute(
        generateAgentSourceDto,
      );

      return res.status(200).send(result);
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }

  @Post('generate-source/upload')
  @Roles('admin')
  async upload(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const body: any = (req as any).body || {};
      const file = body.file;
      const sourceType: string | undefined =
        body.sourceType?.value || undefined;
      const agentId: string | undefined = body.agentId?.value || undefined;

      if (!file || typeof file.toBuffer !== 'function') {
        return res.status(400).send('Arquivo é obrigatório (campo: file)');
      }

      const buffer: Buffer = await file.toBuffer();

      await this.generateAgentSourceService.executeFromBuffer({
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
