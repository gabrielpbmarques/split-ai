import {
  Controller,
  Get,
  Query,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetTokenUsageDto } from 'src/modules/billing/get-token-usage/get-token-usage.dto';
import { GetTokenUsageService } from 'src/modules/billing/get-token-usage/get-token-usage.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('token-usage')
export class GetTokenUsageController {
  constructor(private readonly getTokenUsageService: GetTokenUsageService) {}

  @Get()
  @RequirePermissions('account.access')
  async execute(
    @Query() dto: GetTokenUsageDto,
    @AuthUser() user: AuthenticatedUser,
    @Res() res: FastifyReply,
  ) {
    const isAdmin = user.role === 'admin';

    if (!isAdmin) {
      if (!user.organization_id) {
        throw new ForbiddenException(
          'User does not belong to an organization and cannot view token usage.',
        );
      }
    }

    const result = await this.getTokenUsageService.execute(
      dto,
      user.organization_id,
    );

    return res.status(200).send(result);
  }
}
