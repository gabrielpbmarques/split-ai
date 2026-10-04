import { Body, Controller, Param, Patch, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { UpdateUserDto } from 'src/modules/users/update-user/update-user.dto';
import { UpdateUserService } from 'src/modules/users/update-user/update-user.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@Controller('user')
export class UpdateUserController {
  constructor(private readonly updateUserService: UpdateUserService) {}

  @Patch(':id')
  @RequirePermissions('user.manage')
  async handle(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.updateUserService.execute(id, dto);
    return res.status(200).send(result);
  }
}
