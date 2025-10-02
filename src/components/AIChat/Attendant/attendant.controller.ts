import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { QuestionDto } from 'src/components/AIChat/Question/question.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { AttendantService } from './attendant.service';

@Controller('chat')
export class AttendantController {
  constructor(private readonly attendantService: AttendantService) {}

  @Post('attendant')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: QuestionDto,
    @AuthUser() user: User,
  ) {
    try {
      const result = await this.attendantService.execute(dto, user);
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
}
