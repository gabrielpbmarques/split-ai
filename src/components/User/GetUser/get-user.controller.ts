import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { GetUserService } from './get-user.service';

@Controller('user')
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(@Res() res: FastifyReply, @Param('id') id: string) {
    try {
      const result = await this.getUserService.execute(id);
      return res.status(200).send(result);
    } catch (error) {
      return res.status(error.status || 500).send(error.message || error);
    }
  }
}
