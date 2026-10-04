import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetEmbedSettingsService } from 'src/modules/organizations/get-embed-settings/get-embed-settings.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('organizations')
@Controller('organization')
export class GetEmbedSettingsController {
  constructor(private readonly service: GetEmbedSettingsService) {}

  @Get(':id/embed-settings')
  @RequirePermissions('organization.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Param('id') id: string, @Res() res: FastifyReply) {
    const result = await this.service.execute(id);
    return res.status(200).send(result);
  }
}
