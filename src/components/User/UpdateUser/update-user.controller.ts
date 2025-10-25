import { Body, Controller, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { UpdateUserDto } from './update-user.dto';
import { UpdateUserService } from './update-user.service';

@Controller('user')
export class UpdateUserController {
  constructor(private readonly updateUserService: UpdateUserService) {}

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.updateUserService.execute(id, dto);
      return res.status(200).send(result);
    } catch (error) {
      return res.status(error.status || 500).send(error.message || error);
    }
  }
}
