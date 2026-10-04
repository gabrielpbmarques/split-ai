import { Controller, Param, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { RegenerateEmbedTokenService } from 'src/modules/organizations/regenerate-embed-token/regenerate-embed-token.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@Controller('organization')
export class RegenerateEmbedTokenController {
  constructor(private readonly service: RegenerateEmbedTokenService) {}

  @Post(':id/embed/regenerate-token')
  @RequirePermissions('organization.manage')
  async handle(@Param('id') id: string, @Res() res: FastifyReply) {
    const result = await this.service.execute(id);
    return res.status(200).send(result);
  }
}
