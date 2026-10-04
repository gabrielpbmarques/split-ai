import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ListSessionsDto } from 'src/modules/sessions/list-sessions/list-sessions.dto';
import { ListSessionsService } from 'src/modules/sessions/list-sessions/list-sessions.service';
import { RequireActiveOrganization } from 'src/shared/decorators/active-organization.decorator';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('conversation')
export class ListSessionsController {
  constructor(private readonly listSessionsService: ListSessionsService) {}

  @Get('sessions')
  @RequirePermissions('session.read')
  @RequireActiveOrganization()
  async handle(
    @Query() dto: ListSessionsDto,
    @User() user: AuthenticatedUser,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const sessions = await this.listSessionsService.execute(user, dto);
    return res.status(200).send(sessions);
  }
}
