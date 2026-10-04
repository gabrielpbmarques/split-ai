import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { DashboardChartsDto } from 'src/modules/reports/dashboard-charts/dashboard-charts.dto';
import { DashboardChartsService } from 'src/modules/reports/dashboard-charts/dashboard-charts.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('dashboard')
export class DashboardChartsController {
  constructor(
    private readonly dashboardChartsService: DashboardChartsService,
  ) {}

  @Get('charts')
  @RequirePermissions('analytics.read')
  async getCharts(
    @Res() res: FastifyReply,
    @Query() dto: DashboardChartsDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const charts = await this.dashboardChartsService.execute(user, dto);
    return res.status(200).send(charts);
  }
}
