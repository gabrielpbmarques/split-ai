import { Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { ListApiKeysService } from './list-api-keys.service';

@Controller('api-key')
export class ListApiKeysController {
  constructor(private readonly listApiKeysService: ListApiKeysService) {}

  @Post('list')
  @RequirePermissions('api-key.manage')
  async handle(
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.listApiKeysService.execute(user.organization_id);
    return res.status(200).send(result);
  }
}
