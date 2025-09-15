import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionDto } from './question.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/models/User.model';
import { FastifyReply } from 'fastify';

@Controller('support')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('question')
  @UseGuards(AuthGuard)
  async execute(
    @Res() res: FastifyReply,
    @Body() dto: QuestionDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      await this.questionService.execute(dto, user);

      return res.status(200).send();
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
