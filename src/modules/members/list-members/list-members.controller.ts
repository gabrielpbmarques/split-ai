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
import { ListMembersDto } from 'src/modules/members/list-members/list-members.dto';
import { ListMembersService } from 'src/modules/members/list-members/list-members.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('members')
@Controller('organization/members')
export class ListMembersController {
  constructor(private readonly listMembersService: ListMembersService) {}

  @Post('list')
  @RequirePermissions('member.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
    @Body() dto: ListMembersDto,
  ): Promise<FastifyReply> {
    const result = await this.listMembersService.execute(
      user.organization_id,
      dto,
    );
    return res.status(200).send(result);
  }
}
