import { Body, Controller, Post, Res, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../auth/auth.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { ValidateTokenService } from './ValidateToken.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ValidateTokenDTO } from './ValidateToken.dto';

@Controller('validate-token')
@UseGuards(AuthGuard)
@Roles('worker')
export class ValidateTokenController {
  constructor(private readonly validateTokenService: ValidateTokenService) {}

  @Post()
  async handle(
    @Body() validateTokenDTO: ValidateTokenDTO,
    @Res() reply: FastifyReply,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    try {
      const workerId = request.user.workerId;
      const token = await this.validateTokenService.execute(
        validateTokenDTO,
        workerId,
      );
      reply.status(200).send(token);
    } catch (error) {
      reply.status(400).send({
        message: error.message || 'Erro ao validar token',
        statusCode: 400,
      });
    }
  }
}
