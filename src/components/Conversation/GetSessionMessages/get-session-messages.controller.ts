import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities';

import { GetSessionMessagesService } from './get-session-messages.service';

@Controller('conversation')
export class GetSessionMessagesController {
  constructor(
    private readonly getSessionMessagesService: GetSessionMessagesService,
  ) {}

  @Get('sessions/:sessionId/messages')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(
    @Param('sessionId') sessionId: string,
    @User() user: UserEntity,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const messages = await this.getSessionMessagesService.execute(
        user,
        sessionId,
      );
      return res.status(200).send(messages);
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).send({ error: error.message });
    }
  }
}
