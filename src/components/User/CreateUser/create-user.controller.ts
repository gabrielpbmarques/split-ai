import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { CreateUserDto } from './create-user.dto';
import { CreateUserService } from './create-user.service';

@Controller('user')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(
    @Body(new ValidationPipe()) dto: CreateUserDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.createUserService.execute(dto);
    return res.status(201).send(result);
  }
}
