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

import { RemoveMemberDto } from './remove-member.dto';
import { RemoveMemberService } from './remove-member.service';

@Controller('organization/members')
export class RemoveMemberController {
  constructor(private readonly removeMemberService: RemoveMemberService) {}

  @Post('remove')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: RemoveMemberDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    const result = await this.removeMemberService.execute(
      dto,
      user.organization_id,
      user.id ?? null,
    );
    return res.status(200).send(result);
  }
}
