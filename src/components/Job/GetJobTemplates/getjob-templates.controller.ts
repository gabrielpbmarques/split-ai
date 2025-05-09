import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Job } from 'src/models/Job.model';
import { GetjobTemplatesService } from './getjob-templates.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('jobs')
export class GetjobTemplatesController {
  constructor(
    private readonly getjobTemplatesService: GetjobTemplatesService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async execute(
    @Query('companyId') companyId: string,
  ): Promise<{ options: Job[] }> {
    const jobs = await this.getjobTemplatesService.execute(companyId);
    return {
      options: jobs,
    };
  }
}
