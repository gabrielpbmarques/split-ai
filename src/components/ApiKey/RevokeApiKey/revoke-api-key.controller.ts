import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { RevokeApiKeyDto } from './revoke-api-key.dto';
import { RevokeApiKeyService } from './revoke-api-key.service';

@Controller('api-key')
export class RevokeApiKeyController {
  constructor(private readonly revokeApiKeyService: RevokeApiKeyService) {}

  @Post('revoke')
  @RequirePermissions('api-key.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: RevokeApiKeyDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.revokeApiKeyService.execute(
      dto,
      user.organization_id,
    );
    return res.status(200).send(result);
  }
}
