import {
  Controller,
  Get,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { Public } from 'src/shared/decorators/public.decorator';
import { DatabaseHealthIndicator } from 'src/shared/http/health/database.health';
import { MemoryHealthIndicator } from 'src/shared/http/health/memory.health';

@Controller('health')
export class HealthReadyController {
  constructor(
    private readonly database: DatabaseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get('ready')
  @Public()
  async handle(@Res() res: FastifyReply): Promise<FastifyReply> {
    const [database, memory] = [
      await this.database.ping(),
      this.memory.check(),
    ];
    const checks = { database, memory };

    if (database.status === 'down' || memory.status === 'down') {
      throw new ServiceUnavailableException({
        message: 'Dependências indisponíveis',
        checks,
      });
    }

    return res.status(200).send({ status: 'ok', checks });
  }
}
