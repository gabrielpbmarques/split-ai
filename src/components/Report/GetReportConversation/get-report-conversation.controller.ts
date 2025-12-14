import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities';

import { GetReportConversationService } from './get-report-conversation.service';

@Controller('report')
export class GetReportConversationController {
  constructor(
    private readonly getReportConversationService: GetReportConversationService,
  ) {}

  @Get(':reportId/conversation')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(
    @Param('reportId') reportId: string,
    @User() user: UserEntity,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const conversation = await this.getReportConversationService.execute(
        user,
        reportId,
      );
      return res.status(200).send(conversation);
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).send({ error: error.message });
    }
  }
}
