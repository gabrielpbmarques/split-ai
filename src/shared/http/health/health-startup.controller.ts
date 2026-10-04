import {
  Controller,
  Get,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/auth/auth.guard';
import { DatabaseHealthIndicator } from 'src/shared/http/health/database.health';

@Controller('health')
export class HealthStartupController {
  constructor(private readonly database: DatabaseHealthIndicator) {}

  @Get('startup')
  @Public()
  async handle(@Res() res: FastifyReply): Promise<FastifyReply> {
    const database = this.database.isInitialized();

    if (database.status === 'down') {
      throw new ServiceUnavailableException('Banco de dados não inicializado');
    }

    return res.status(200).send({ status: 'ok', checks: { database } });
  }
}
