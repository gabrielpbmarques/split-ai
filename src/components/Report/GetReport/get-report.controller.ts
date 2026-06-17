import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { GetReportService } from './get-report.service';

@Controller('report')
export class GetReportController {
  constructor(private readonly getReportService: GetReportService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async execute(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @AuthUser() user: User,
  ) {
    try {
      const report = await this.getReportService.execute(user, id);
      return res.status(200).send(report);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message || error);
    }
  }
}
