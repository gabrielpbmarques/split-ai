import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { InviteMemberDto } from './invite-member.dto';
import { InviteMemberService } from './invite-member.service';

@Controller('organization/members')
export class InviteMemberController {
  constructor(private readonly inviteMemberService: InviteMemberService) {}

  @Post('invite')
  @RequirePermissions('member.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: InviteMemberDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.inviteMemberService.execute(
      dto,
      user.organization_id,
    );
    return res.status(201).send(result);
  }
}
