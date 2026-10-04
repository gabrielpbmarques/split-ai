import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { ListReportsDto } from './list-reports.dto';
import { ListReportsService } from './list-reports.service';

@Controller('report')
export class ListReportsController {
  constructor(private readonly listReportsService: ListReportsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async execute(
    @Res() res: FastifyReply,
    @Query() dto: ListReportsDto,
    @AuthUser() user: User,
  ) {
    const reports = await this.listReportsService.execute(user, dto);
    return res.status(200).send(reports);
  }
}
