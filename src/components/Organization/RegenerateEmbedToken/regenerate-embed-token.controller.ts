import { Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { RegenerateEmbedTokenService } from './regenerate-embed-token.service';

@Controller('organization')
export class RegenerateEmbedTokenController {
  constructor(private readonly service: RegenerateEmbedTokenService) {}

  @Post(':id/embed/regenerate-token')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(@Param('id') id: string, @Res() res: FastifyReply) {
    const result = await this.service.execute(id);
    return res.status(200).send(result);
  }
}
