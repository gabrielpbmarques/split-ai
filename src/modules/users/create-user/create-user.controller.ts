import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { CreateUserDto } from 'src/modules/users/create-user/create-user.dto';
import { CreateUserService } from 'src/modules/users/create-user/create-user.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('users')
@Controller('user')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  @RequirePermissions('user.manage')
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Body() dto: CreateUserDto, @Res() res: FastifyReply) {
    const result = await this.createUserService.execute(dto);
    return res.status(201).send(result);
  }
}
