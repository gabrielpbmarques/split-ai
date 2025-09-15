import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { GenerateAgentSourceDto } from './generate-agent-source.dto';
import { GenerateAgentSourceService } from './generate-agent-source.service';

@Controller('agent')
export class GenerateAgentSourceController {
  constructor(
    private readonly generateAgentSourceService: GenerateAgentSourceService,
  ) {}

  @Post('generate-source')
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
}
