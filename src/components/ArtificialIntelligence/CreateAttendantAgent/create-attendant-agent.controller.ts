import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { CreateAttendantAgentDto } from './create-attendant-agent.dto';
import { CreateAttendantAgentService } from './create-attendant-agent.service';

@Controller('agent')
export class CreateAttendantAgentController {
  constructor(
    private readonly createAttendantAgentService: CreateAttendantAgentService,
  ) {}

  @Post('/create/attendant')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: CreateAttendantAgentDto,
    @AuthUser() user: User,
  ) {
    try {
      const result = await this.createAttendantAgentService.execute(dto, user);
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(500).send(error.message);
    }
  }
}
