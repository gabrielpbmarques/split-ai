import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetSessionMessagesService } from 'src/modules/sessions/get-session-messages/get-session-messages.service';
import { RequireActiveOrganization } from 'src/shared/decorators/active-organization.decorator';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('conversation')
export class GetSessionMessagesController {
  constructor(
    private readonly getSessionMessagesService: GetSessionMessagesService,
  ) {}

  @Get('sessions/:sessionId/messages')
  @RequirePermissions('session.read')
  @RequireActiveOrganization()
  async handle(
    @Param('sessionId') sessionId: string,
    @User() user: AuthenticatedUser,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const messages = await this.getSessionMessagesService.execute(
      user,
      sessionId,
    );
    return res.status(200).send(messages);
  }
}
