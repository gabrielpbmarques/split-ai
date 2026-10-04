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
import { requireOrganizationId } from 'src/auth/request-user';
import { RevokeApiKeyDto } from 'src/modules/api-keys/revoke-api-key/revoke-api-key.dto';
import { RevokeApiKeyService } from 'src/modules/api-keys/revoke-api-key/revoke-api-key.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('api-keys')
@Controller('api-key')
export class RevokeApiKeyController {
  constructor(private readonly revokeApiKeyService: RevokeApiKeyService) {}

  @Post('revoke')
  @RequirePermissions('api-key.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: RevokeApiKeyDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.revokeApiKeyService.execute(
      dto,
      requireOrganizationId(user),
    );
    return res.status(200).send(result);
  }
}
