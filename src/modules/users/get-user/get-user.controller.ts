import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { GetUserService } from 'src/modules/users/get-user/get-user.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@Controller('user')
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Get(':id')
  @RequirePermissions('user.read')
  async handle(@Res() res: FastifyReply, @Param('id') id: string) {
    const result = await this.getUserService.execute(id);
    return res.status(200).send(result);
  }
}
