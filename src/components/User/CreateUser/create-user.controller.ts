import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { CreateUserDto } from './create-user.dto';
import { CreateUserService } from './create-user.service';

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
