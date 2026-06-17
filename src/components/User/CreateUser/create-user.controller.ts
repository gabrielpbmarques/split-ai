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
    try {
      const result = await this.createUserService.execute(dto);
      return res.status(201).send(result);
    } catch (error: any) {
      const status = error.status || error.statusCode || 500;
      const message = error.message || 'Erro interno do servidor';
      return res.status(status).send({ statusCode: status, message });
    }
  }
}
