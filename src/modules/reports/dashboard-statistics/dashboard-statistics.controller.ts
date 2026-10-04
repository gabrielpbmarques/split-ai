import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { DashboardStatisticsDto } from 'src/modules/reports/dashboard-statistics/dashboard-statistics.dto';
import { DashboardStatisticsService } from 'src/modules/reports/dashboard-statistics/dashboard-statistics.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('reports')
@Controller('dashboard')
export class DashboardStatisticsController {
  constructor(
    private readonly dashboardStatisticsService: DashboardStatisticsService,
  ) {}

  @Get('statistics')
  @RequirePermissions('analytics.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Query() dto: DashboardStatisticsDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const statistics = await this.dashboardStatisticsService.execute(user, dto);
    return res.status(200).send(statistics);
  }
}
