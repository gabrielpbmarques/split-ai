import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { DashboardChartsDto } from './dashboard-charts.dto';
import { DashboardChartsService } from './dashboard-charts.service';

@Controller('dashboard')
export class DashboardChartsController {
  constructor(
    private readonly dashboardChartsService: DashboardChartsService,
  ) {}

  @Get('charts')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async getCharts(
    @Res() res: FastifyReply,
    @Query() dto: DashboardChartsDto,
    @AuthUser() user: User,
  ) {
    const charts = await this.dashboardChartsService.execute(user, dto);
    return res.status(200).send(charts);
  }
}
