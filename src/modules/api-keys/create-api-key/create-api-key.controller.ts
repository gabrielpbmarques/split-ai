import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { requireOrganizationId } from 'src/auth/request-user';
import { CreateApiKeyDto } from 'src/modules/api-keys/create-api-key/create-api-key.dto';
import { CreateApiKeyService } from 'src/modules/api-keys/create-api-key/create-api-key.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('api-keys')
@Controller('api-key')
export class CreateApiKeyController {
  constructor(private readonly createApiKeyService: CreateApiKeyService) {}

  @Post('create')
  @RequirePermissions('api-key.manage')
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: CreateApiKeyDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.createApiKeyService.execute(
      dto,
      requireOrganizationId(user),
      user.id ?? null,
    );
    return res.status(201).send(result);
  }
}
