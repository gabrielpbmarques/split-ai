import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { CreateSessionIfNotExistsDto } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.dto';
import { CreateSessionIfNotExistsService } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('session')
export class CreateSessionIfNotExistsController {
  constructor(
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
  ) {}

  @Post()
  @RequirePermissions('account.access')
  async handle(
    @AuthUser() user: AuthenticatedUser,
    @Res() res: FastifyReply,
    @Body() body: CreateSessionIfNotExistsDto,
  ) {
    await this.createSessionIfNotExistsService.execute({
      agent_id: body.agent_id,
      user_id: user.id,
    });
    return res.status(200).send('Session created successfully');
  }
}
