import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

import { AnalyticsAskDto } from './analytics-ask.dto';
import { AnalyticsAskService } from './analytics-ask.service';

@Controller('analytics')
export class AnalyticsAskController {
  constructor(private readonly service: AnalyticsAskService) {}

  @Post('ask')
  @UseGuards(ApiKeyGuard)
  async execute(
    @Res() res: FastifyReply,
    @Body() dto: AnalyticsAskDto,
  ): Promise<void> {
    res.hijack();
    res.raw.writeHead(200, {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const writeEvent = (event: unknown) => {
      try {
        res.raw.write(`${JSON.stringify(event)}\n`);
      } catch {
        /* socket may have been closed by the client */
      }
    };

    try {
      await this.service.execute(dto, writeEvent);
    } catch (error) {
      writeEvent({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro inesperado',
      });
      writeEvent({ type: 'done' });
    } finally {
      try {
        res.raw.end();
      } catch {
        /* socket already closed */
      }
    }
  }
}
