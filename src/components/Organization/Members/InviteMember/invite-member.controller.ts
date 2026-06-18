import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrgRoleGuard } from 'src/auth/org-role.guard';
import { OrgRoles } from 'src/decorators/org-roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { InviteMemberDto } from './invite-member.dto';
import { InviteMemberService } from './invite-member.service';

@Controller('organization/members')
export class InviteMemberController {
  constructor(private readonly inviteMemberService: InviteMemberService) {}

  @Post('invite')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: InviteMemberDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.inviteMemberService.execute(
        dto,
        user.organization_id,
      );
      return res.status(201).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
