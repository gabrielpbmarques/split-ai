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
import { ListApiKeysDto } from 'src/modules/api-keys/list-api-keys/list-api-keys.dto';
import { ListApiKeysService } from 'src/modules/api-keys/list-api-keys/list-api-keys.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('api-keys')
@Controller('api-key')
export class ListApiKeysController {
  constructor(private readonly listApiKeysService: ListApiKeysService) {}

  @Post('list')
  @RequirePermissions('api-key.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
    @Body() dto: ListApiKeysDto,
  ): Promise<FastifyReply> {
    const result = await this.listApiKeysService.execute(
      requireOrganizationId(user),
      dto,
    );
    return res.status(200).send(result);
  }
}
