import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ListReportsDto } from 'src/modules/reports/list-reports/list-reports.dto';
import { ListReportsService } from 'src/modules/reports/list-reports/list-reports.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('report')
export class ListReportsController {
  constructor(private readonly listReportsService: ListReportsService) {}

  @Get()
  @RequirePermissions('report.read')
  async execute(
    @Res() res: FastifyReply,
    @Query() dto: ListReportsDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const reports = await this.listReportsService.execute(user, dto);
    return res.status(200).send(reports);
  }
}
