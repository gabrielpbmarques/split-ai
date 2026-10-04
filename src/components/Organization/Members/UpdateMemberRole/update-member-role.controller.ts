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

import { UpdateMemberRoleDto } from './update-member-role.dto';
import { UpdateMemberRoleService } from './update-member-role.service';

@Controller('organization/members')
export class UpdateMemberRoleController {
  constructor(
    private readonly updateMemberRoleService: UpdateMemberRoleService,
  ) {}

  @Post('role')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: UpdateMemberRoleDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    const result = await this.updateMemberRoleService.execute(
      dto,
      user.organization_id,
    );
    return res.status(200).send(result);
  }
}
