import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CheckEstablishmentFeatureAccessService } from './CheckEstablishmentFeatureAccess.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('check-feature-access')
@UseGuards(AuthGuard)
@Roles('establishment', 'company')
export class CheckEstablishmentFeatureAccessController {
  constructor(
    private readonly checkEstablishmentFeatureAccessService: CheckEstablishmentFeatureAccessService,
  ) {}

  @Get()
  async handle(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const workerId = request.user.workerId;
      const isAccess =
        await this.checkEstablishmentFeatureAccessService.execute(workerId);
      reply.status(200).send(isAccess);
    } catch (error) {
      reply.status(400).send({
        message: error.message || 'Erro ao verificar acesso à funcionalidade',
        statusCode: 400,
      });
    }
  }
}
