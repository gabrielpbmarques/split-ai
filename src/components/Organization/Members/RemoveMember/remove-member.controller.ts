import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { RemoveMemberDto } from './remove-member.dto';
import { RemoveMemberService } from './remove-member.service';

@Controller('organization/members')
export class RemoveMemberController {
  constructor(private readonly removeMemberService: RemoveMemberService) {}

  @Post('remove')
  @RequirePermissions('member.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: RemoveMemberDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.removeMemberService.execute(
      dto,
      user.organization_id,
      user.id ?? null,
    );
    return res.status(200).send(result);
  }
}
