import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListUsersDto } from 'src/modules/users/list-users/list-users.dto';
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
  async handle(
    @Query() dto: ListUsersDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const result = await this.listUsersService.execute(dto);
    return res.status(200).send(result);
  }
}
