import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetDashboardDataDto } from 'src/modules/reports/get-dashboard-data/get-dashboard-data.dto';
import { GetDashboardDataService } from 'src/modules/reports/get-dashboard-data/get-dashboard-data.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('reports')
@Controller('analytics')
export class GetDashboardDataController {
  constructor(
    private readonly getDashboardDataService: GetDashboardDataService,
  ) {}

  @Get('dashboard-data')
  @RequirePermissions('analytics.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Res() res: FastifyReply, @Query() query: GetDashboardDataDto) {
    const data = await this.getDashboardDataService.execute(query);
    return res.status(200).send(data);
  }
}
