import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities';

import { CreateSessionIfNotExistsDto } from './create-session-if-not-exists.dto';
import { CreateSessionIfNotExistsService } from './create-session-if-not-exists.service';

@Controller('session')
export class CreateSessionIfNotExistsController {
  constructor(
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async handle(
    @AuthUser() user: UserEntity,
    @Res() res: FastifyReply,
    @Body() body: CreateSessionIfNotExistsDto,
  ) {
    try {
      await this.createSessionIfNotExistsService.execute({
        agent_id: body.agent_id,
        user_id: user.id,
      });
      return res.status(200).send('Session created successfully');
    } catch (error) {
      return res.status(500).send(error);
    }
  }
}
