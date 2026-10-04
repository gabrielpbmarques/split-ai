import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { ListUsersService } from './list-users.service';

@Controller('user')
export class ListUsersController {
  constructor(private readonly listUsersService: ListUsersService) {}

  @Get()
  @RequirePermissions('user.manage')
  async handle(@Res() res: FastifyReply) {
    const result = await this.listUsersService.execute();
    return res.status(200).send(result);
  }
}
