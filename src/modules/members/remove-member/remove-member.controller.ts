import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RemoveMemberDto } from 'src/modules/members/remove-member/remove-member.dto';
import { RemoveMemberService } from 'src/modules/members/remove-member/remove-member.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

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
