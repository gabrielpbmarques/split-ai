import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RemoveMemberDto } from 'src/modules/members/remove-member/remove-member.dto';
import { RemoveMemberService } from 'src/modules/members/remove-member/remove-member.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('members')
@Controller('organization/members')
export class RemoveMemberController {
  constructor(private readonly removeMemberService: RemoveMemberService) {}

  @Post('remove')
  @RequirePermissions('member.manage')
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: RemoveMemberDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    await this.removeMemberService.execute(
      dto,
      user.organization_id,
      user.id ?? null,
    );
    return res.status(204).send();
  }
}
