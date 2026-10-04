import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { DashboardStatisticsDto } from './dashboard-statistics.dto';
import { DashboardStatisticsService } from './dashboard-statistics.service';

@Controller('dashboard')
export class DashboardStatisticsController {
  constructor(
    private readonly dashboardStatisticsService: DashboardStatisticsService,
  ) {}

  @Get('statistics')
  @RequirePermissions('analytics.read')
  async getStatistics(
    @Res() res: FastifyReply,
    @Query() dto: DashboardStatisticsDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const statistics = await this.dashboardStatisticsService.execute(user, dto);
    return res.status(200).send(statistics);
  }
}
