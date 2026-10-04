import { Controller, Get, Param } from '@nestjs/common';

import { GetSourceService } from 'src/modules/sources/get-source/get-source.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@Controller('source')
export class GetSourceController {
  constructor(private readonly getSourceService: GetSourceService) {}

  @Get(':id')
  @RequirePermissions('source.read')
  async handle(@Param('id') id: string) {
    return this.getSourceService.execute(id);
  }
}
