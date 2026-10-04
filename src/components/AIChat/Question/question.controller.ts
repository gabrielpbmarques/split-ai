import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequireActiveOrganization } from 'src/shared/decorators/active-organization.decorator';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';
import { StreamEvent } from 'src/types';

import { QuestionDto } from './question.dto';
import { QuestionService } from './question.service';

@Controller('support')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('question')
  @RequirePermissions('chat.ask')
  @RequireActiveOrganization()
  async execute(
    @Res() res: FastifyReply,
    @Body() dto: QuestionDto,
    @AuthUser() user: AuthenticatedUser,
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
