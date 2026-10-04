import { Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ListApiKeysService } from 'src/modules/api-keys/list-api-keys/list-api-keys.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

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
