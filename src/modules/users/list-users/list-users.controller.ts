import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { ListUsersService } from 'src/modules/users/list-users/list-users.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

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
