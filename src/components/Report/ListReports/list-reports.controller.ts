import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { ListReportsDto } from './list-reports.dto';
import { ListReportsService } from './list-reports.service';

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
