import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { UpdateMemberRoleDto } from 'src/modules/members/update-member-role/update-member-role.dto';
import { UpdateMemberRoleService } from 'src/modules/members/update-member-role/update-member-role.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('organization/members')
export class UpdateMemberRoleController {
  constructor(
    private readonly updateMemberRoleService: UpdateMemberRoleService,
  ) {}

  @Post('role')
  @RequirePermissions('member.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: UpdateMemberRoleDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.updateMemberRoleService.execute(
      dto,
      user.organization_id,
    );
    return res.status(200).send(result);
  }
}
