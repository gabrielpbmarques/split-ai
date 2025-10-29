import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { QuestionDto } from 'src/components/AIChat/Question/question.dto';
import { Roles } from 'src/decorators/roles.decorator';

import { AttendantService } from './attendant.service';

@Controller('chat')
export class AttendantController {
  constructor(private readonly attendantService: AttendantService) {}

  @Post('attendant')
  @Roles('admin', 'user')
  async handle(@Res() res: FastifyReply, @Body() dto: QuestionDto) {
    try {
      const result = await this.attendantService.execute(dto);
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
}
