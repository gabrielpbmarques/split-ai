import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetUserService } from 'src/modules/users/get-user/get-user.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('users')
@Controller('user')
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Get(':id')
  @RequirePermissions('user.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Res() res: FastifyReply, @Param('id') id: string) {
    const result = await this.getUserService.execute(id);
    return res.status(200).send(result);
  }
}
