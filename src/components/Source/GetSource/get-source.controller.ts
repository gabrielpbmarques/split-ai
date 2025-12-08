import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { GetSourceService } from './get-source.service';

@Controller('source')
@UseGuards(AuthGuard)
export class GetSourceController {
  constructor(private readonly getSourceService: GetSourceService) {}

  @Get(':id')
  @Roles('admin', 'user')
  async handle(@Param('id') id: string) {
    return this.getSourceService.execute(id);
  }
}
