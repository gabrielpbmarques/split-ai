import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { DashboardChartsDto } from './dashboard-charts.dto';
import { DashboardChartsService } from './dashboard-charts.service';

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
