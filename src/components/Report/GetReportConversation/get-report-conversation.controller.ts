import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';

import { GetReportConversationService } from './get-report-conversation.service';

@Controller('report')
export class GetReportConversationController {
  constructor(
    private readonly getReportConversationService: GetReportConversationService,
  ) {}

  @Get(':reportId/conversation')
  @RequirePermissions('report.read')
  async handle(
    @Param('reportId') reportId: string,
    @User() user: AuthenticatedUser,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const conversation = await this.getReportConversationService.execute(
      user,
      reportId,
    );
    return res.status(200).send(conversation);
  }
}
