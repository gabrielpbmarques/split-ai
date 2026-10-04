import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { UpdateMemberRoleDto } from 'src/modules/members/update-member-role/update-member-role.dto';
import { UpdateMemberRoleService } from 'src/modules/members/update-member-role/update-member-role.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('members')
@Controller('organization/members')
export class UpdateMemberRoleController {
  constructor(
    private readonly updateMemberRoleService: UpdateMemberRoleService,
  ) {}

  @Post('role')
  @RequirePermissions('member.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: UpdateMemberRoleDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.updateMemberRoleService.execute(
      dto,
      user.organization_id,
    );
    return res.status(200).send(result);
  }
}
