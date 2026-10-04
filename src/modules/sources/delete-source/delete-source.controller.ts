import { Controller, Delete, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { DeleteSourceService } from 'src/modules/sources/delete-source/delete-source.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('sources')
@Controller('source')
export class DeleteSourceController {
  constructor(private readonly deleteSourceService: DeleteSourceService) {}

  @Delete(':id')
  @RequirePermissions('source.write')
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Param('id') id: string,
    @AuthUser() user: AuthenticatedUser,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    await this.deleteSourceService.execute(id, user);
    return res.status(204).send();
  }
}
