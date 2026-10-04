import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { InviteMemberDto } from 'src/modules/members/invite-member/invite-member.dto';
import { InviteMemberService } from 'src/modules/members/invite-member/invite-member.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('members')
@Controller('organization/members')
export class InviteMemberController {
  constructor(private readonly inviteMemberService: InviteMemberService) {}

  @Post('invite')
  @RequirePermissions('member.manage')
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: InviteMemberDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.inviteMemberService.execute(
      dto,
      user.organization_id,
    );
    return res.status(201).send(result);
  }
}
