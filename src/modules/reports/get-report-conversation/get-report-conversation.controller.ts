import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetReportConversationService } from 'src/modules/reports/get-report-conversation/get-report-conversation.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';

@ApiTags('reports')
@Controller('report')
export class GetReportConversationController {
  constructor(
    private readonly getReportConversationService: GetReportConversationService,
  ) {}

  @Get(':reportId/conversation')
  @RequirePermissions('report.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
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
