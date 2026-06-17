import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { GetDashboardDataService } from './get-dashboard-data.service';

@Controller('analytics')
export class GetDashboardDataController {
  constructor(
    private readonly getDashboardDataService: GetDashboardDataService,
  ) {}

  @Get('dashboard-data')
  @UseGuards(AuthGuard)
  @Roles('user', 'admin')
  async handle(
    @Res() res: FastifyReply,
    @Query() query: any,
    @UserDecorator() user: User,
  ) {
    try {
      const data = await this.getDashboardDataService.execute(user, query);
      return res.status(200).send(data);
    } catch (error: any) {
      const status = (error && (error.status || error.statusCode)) || 500;
      return res.status(status).send(error.message || 'Internal server error');
    }
  }
}
