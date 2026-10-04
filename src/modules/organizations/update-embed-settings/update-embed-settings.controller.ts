import { Body, Controller, Param, Patch, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { UpdateEmbedSettingsDto } from 'src/modules/organizations/update-embed-settings/update-embed-settings.dto';
import { UpdateEmbedSettingsService } from 'src/modules/organizations/update-embed-settings/update-embed-settings.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@Controller('organization')
export class UpdateEmbedSettingsController {
  constructor(private readonly service: UpdateEmbedSettingsService) {}

  @Patch(':id/embed-settings')
  @RequirePermissions('organization.manage')
  async handle(
    @Param('id') id: string,
    @Body() dto: UpdateEmbedSettingsDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.service.execute(id, dto);
    return res.status(200).send(result);
  }
}
