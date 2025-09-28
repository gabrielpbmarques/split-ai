import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities';

import { QuestionDto } from './question.dto';
import { QuestionService } from './question.service';

@Controller('support')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('question')
  @UseGuards(AuthGuard)
  async execute(
    @Res() res: FastifyReply,
    @Body() dto: QuestionDto,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    res.hijack();
    try {
      res.raw.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
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

      await this.questionService.execute(dto, user, (chunk) => {
        if (chunk?.content) {
          res.raw.write(chunk.content.toString());
        }
      });
    } catch (error: any) {
      try {
        const message =
          typeof error?.message === 'string'
            ? `\n${error.message}\n`
            : '\nUnexpected error\n';
        res.raw.write(message);
      } catch {}
    } finally {
      res.raw.end();
    }
  }
}
