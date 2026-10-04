import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetDashboardDataService } from 'src/modules/reports/get-dashboard-data/get-dashboard-data.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';

@Controller('analytics')
export class GetDashboardDataController {
  constructor(
    private readonly getDashboardDataService: GetDashboardDataService,
  ) {}

  @Get('dashboard-data')
  @RequirePermissions('analytics.read')
  async handle(
    @Res() res: FastifyReply,
    @Query() query: any,
    @UserDecorator() user: AuthenticatedUser,
  ) {
    const data = await this.getDashboardDataService.execute(user, query);
    return res.status(200).send(data);
  }
}
