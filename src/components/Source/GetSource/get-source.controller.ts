import { Controller, Get, Param } from '@nestjs/common';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { GetSourceService } from './get-source.service';

@Controller('source')
export class GetSourceController {
  constructor(private readonly getSourceService: GetSourceService) {}

  @Get(':id')
  @RequirePermissions('source.read')
  async handle(@Param('id') id: string) {
    return this.getSourceService.execute(id);
  }
}
