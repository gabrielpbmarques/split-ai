import {
  Controller,
  Get,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { Public } from 'src/shared/decorators/public.decorator';
import { DatabaseHealthIndicator } from 'src/shared/http/health/database.health';

@Controller('health')
export class HealthStartupController {
  constructor(private readonly database: DatabaseHealthIndicator) {}

  @Get('startup')
  @Public()
  async handle(@Res() res: FastifyReply): Promise<FastifyReply> {
    const migrations = await this.database.migrationsApplied();

    if (migrations.status === 'down') {
      throw new ServiceUnavailableException(migrations.detail);
    }

    return res.status(200).send({ status: 'ok', checks: { migrations } });
  }
}
