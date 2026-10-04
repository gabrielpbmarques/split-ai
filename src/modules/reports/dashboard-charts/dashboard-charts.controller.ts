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
import { DashboardChartsDto } from 'src/modules/reports/dashboard-charts/dashboard-charts.dto';
import { DashboardChartsService } from 'src/modules/reports/dashboard-charts/dashboard-charts.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('reports')
@Controller('dashboard')
export class DashboardChartsController {
  constructor(
    private readonly dashboardChartsService: DashboardChartsService,
  ) {}

  @Get('charts')
  @RequirePermissions('analytics.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Query() dto: DashboardChartsDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const charts = await this.dashboardChartsService.execute(user, dto);
    return res.status(200).send(charts);
  }
}
