import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetReportService } from 'src/modules/reports/get-report/get-report.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('report')
export class GetReportController {
  constructor(private readonly getReportService: GetReportService) {}

  @Get(':id')
  @RequirePermissions('report.read')
  async execute(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const report = await this.getReportService.execute(user, id);
    return res.status(200).send(report);
  }
}
