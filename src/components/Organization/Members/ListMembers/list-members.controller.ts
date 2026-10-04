import { Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { ListMembersService } from './list-members.service';

@Controller('organization/members')
export class ListMembersController {
  constructor(private readonly listMembersService: ListMembersService) {}

  @Post('list')
  @RequirePermissions('member.manage')
  async handle(
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.listMembersService.execute(user.organization_id);
    return res.status(200).send(result);
  }
}
