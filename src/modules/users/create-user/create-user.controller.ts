import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { CreateUserDto } from 'src/modules/users/create-user/create-user.dto';
import { CreateUserService } from 'src/modules/users/create-user/create-user.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@Controller('user')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  @RequirePermissions('user.manage')
  async handle(
    @Body(new ValidationPipe()) dto: CreateUserDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.createUserService.execute(dto);
    return res.status(201).send(result);
  }
}
