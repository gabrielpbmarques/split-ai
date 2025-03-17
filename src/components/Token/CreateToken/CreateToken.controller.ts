import { Body, Controller, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { CreateTokenService } from './CreateToken.service';
import { CreateTokenDTO } from './CreateToken.dto';

@Controller('token')
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
