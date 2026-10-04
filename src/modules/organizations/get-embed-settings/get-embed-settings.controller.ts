import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { GetEmbedSettingsService } from 'src/modules/organizations/get-embed-settings/get-embed-settings.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@Controller('organization')
export class GetEmbedSettingsController {
  constructor(private readonly service: GetEmbedSettingsService) {}

  @Get(':id/embed-settings')
  @RequirePermissions('organization.manage')
  async handle(@Param('id') id: string, @Res() res: FastifyReply) {
    const result = await this.service.execute(id);
    return res.status(200).send(result);
  }
}
