import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { DashboardStatisticsDto } from './dashboard-statistics.dto';
import { DashboardStatisticsService } from './dashboard-statistics.service';

@Controller('dashboard')
export class DashboardStatisticsController {
  constructor(
    private readonly dashboardStatisticsService: DashboardStatisticsService,
  ) {}

  @Get('statistics')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async getStatistics(
    @Res() res: FastifyReply,
    @Query() dto: DashboardStatisticsDto,
    @AuthUser() user: User,
  ) {
    const statistics = await this.dashboardStatisticsService.execute(user, dto);
    return res.status(200).send(statistics);
  }
}
