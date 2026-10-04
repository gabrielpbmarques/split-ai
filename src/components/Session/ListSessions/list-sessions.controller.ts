import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ActiveOrgGuard } from 'src/auth/active-org.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities';

import { ListSessionsDto } from './list-sessions.dto';
import { ListSessionsService } from './list-sessions.service';

@Controller('conversation')
export class ListSessionsController {
  constructor(private readonly listSessionsService: ListSessionsService) {}

  @Get('sessions')
  @UseGuards(AuthGuard, ActiveOrgGuard)
  @Roles('admin', 'user')
  async handle(
    @Query() dto: ListSessionsDto,
    @User() user: UserEntity,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const sessions = await this.listSessionsService.execute(user, dto);
    return res.status(200).send(sessions);
  }
}
