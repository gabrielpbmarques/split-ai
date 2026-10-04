import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { GetProfileService } from './get-profile.service';

@Controller('profile')
export class GetProfileController {
  constructor(private readonly getProfileService: GetProfileService) {}

  @Get()
  @RequirePermissions('account.access')
  async handle(
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.getProfileService.execute(user.id);
    return res.status(200).send(result);
  }
}
