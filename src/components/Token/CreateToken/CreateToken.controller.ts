import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../auth/auth.guard';
import { Roles } from '../../../decorators/roles.decorator';
import type { FastifyReply } from 'fastify';
import { CreateTokenService } from './CreateToken.service';
import { CreateTokenDTO } from './CreateToken.dto';

@Controller('token')
@UseGuards(AuthGuard)
@Roles('establishment', 'company')
export class CreateTokenController {
  constructor(private readonly createTokenService: CreateTokenService) {}

  @Post()
  async handle(
    @Body() createTokenDTO: CreateTokenDTO,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    try {
      const token = await this.createTokenService.execute(createTokenDTO);
      reply.status(200).send(token);
    } catch (error) {
      reply.status(400).send({
        message: error.message || 'Erro ao criar token',
        statusCode: 400,
      });
    }
  }
}
