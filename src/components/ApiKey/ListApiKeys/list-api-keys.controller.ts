import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrgRoleGuard } from 'src/auth/org-role.guard';
import { OrgRoles } from 'src/decorators/org-roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { ListApiKeysService } from './list-api-keys.service';

@Controller('api-key')
export class ListApiKeysController {
  constructor(private readonly listApiKeysService: ListApiKeysService) {}

  @Post('list')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin')
  async handle(
    @Res() res: FastifyReply,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.listApiKeysService.execute(
        user.organization_id,
      );
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
