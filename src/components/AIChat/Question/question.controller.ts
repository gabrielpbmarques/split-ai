import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ActiveOrgGuard } from 'src/auth/active-org.guard';
import { CompositeAuthGuard } from 'src/auth/composite-auth.guard';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities';
import { StreamEvent } from 'src/types';

import { QuestionDto } from './question.dto';
import { QuestionService } from './question.service';

@Controller('support')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('question')
  @UseGuards(CompositeAuthGuard, ActiveOrgGuard)
  async execute(
    @Res() res: FastifyReply,
    @Body() dto: QuestionDto,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    res.hijack();
    res.raw.writeHead(200, {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Expose-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const writeEvent = (event: StreamEvent) => {
      try {
        res.raw.write(`${JSON.stringify(event)}\n`);
      } catch {
        res.raw.end();
      }
    };

    let serviceTerminated = false;

    try {
      await this.questionService.execute(dto, user, (event) => {
        if (event.type === 'done') {
          serviceTerminated = true;
        }
        writeEvent(event);
      });
    } catch (error: any) {
      writeEvent({
        type: 'error',
        message:
          typeof error?.message === 'string'
            ? error.message
            : 'Erro inesperado',
      });
      if (!serviceTerminated) {
        writeEvent({ type: 'done' });
        serviceTerminated = true;
      }
    } finally {
      if (!serviceTerminated) {
        writeEvent({ type: 'done' });
      }
      res.raw.end();
    }
  }
}
