import { Controller, Param, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { RegenerateEmbedTokenService } from 'src/modules/organizations/regenerate-embed-token/regenerate-embed-token.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('organizations')
@Controller('organization')
export class RegenerateEmbedTokenController {
  constructor(private readonly service: RegenerateEmbedTokenService) {}

  @Post(':id/embed/regenerate-token')
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
