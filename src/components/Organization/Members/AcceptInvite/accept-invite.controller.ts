import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/auth/auth.guard';

import { AcceptInviteDto } from './accept-invite.dto';
import { AcceptInviteService } from './accept-invite.service';

@Controller('organization/members')
export class AcceptInviteController {
  constructor(private readonly acceptInviteService: AcceptInviteService) {}

  @Post('accept')
  @Public()
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: AcceptInviteDto,
  ): Promise<FastifyReply> {
    const result = await this.acceptInviteService.execute(dto);
    return res.status(200).send(result);
  }
}
