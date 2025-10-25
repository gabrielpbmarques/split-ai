import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { ListUsersService } from './list-users.service';

@Controller('user')
export class ListUsersController {
  constructor(private readonly listUsersService: ListUsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(@Res() res: FastifyReply) {
    try {
      const result = await this.listUsersService.execute();
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
}
