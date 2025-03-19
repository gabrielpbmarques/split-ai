import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { CheckActivityTokenNeedService } from './check-activity-token-need.service';

@Controller('check-activity-token-need')
export class CheckActivityTokenNeedController {
  constructor(
    private readonly checkActivityTokenNeedService: CheckActivityTokenNeedService,
  ) {}

  @Get()
  async handle(@Query() { activityId }: any, @Res() reply: FastifyReply) {
    try {
      const isTokenNeeded =
        await this.checkActivityTokenNeedService.execute(activityId);
      reply.status(200).send(isTokenNeeded);
    } catch (error) {
      reply.status(400).send({
        message: error.message || 'Erro ao verificar token necessário',
        statusCode: 400,
      });
    }
  }
}
