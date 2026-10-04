import { Controller, Get, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListUsersService } from 'src/modules/users/list-users/list-users.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('users')
@Controller('user')
export class ListUsersController {
  constructor(private readonly listUsersService: ListUsersService) {}

  @Get()
  @RequirePermissions('user.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Res() res: FastifyReply) {
    const result = await this.listUsersService.execute();
    return res.status(200).send(result);
  }
}
