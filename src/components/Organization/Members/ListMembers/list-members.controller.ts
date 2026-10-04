import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrgRoleGuard } from 'src/auth/org-role.guard';
import { OrgRoles } from 'src/decorators/org-roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { ListMembersService } from './list-members.service';

@Controller('organization/members')
export class ListMembersController {
  constructor(private readonly listMembersService: ListMembersService) {}

  @Post('list')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin')
  async handle(
    @Res() res: FastifyReply,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    const result = await this.listMembersService.execute(user.organization_id);
    return res.status(200).send(result);
  }
}
