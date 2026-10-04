import {
  Controller,
  Get,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { IntegrationHealthIndicator } from 'src/infrastructure/integration/integration.health';
import { Public } from 'src/shared/decorators/public.decorator';
import { DatabaseHealthIndicator } from 'src/shared/http/health/database.health';
import { MemoryHealthIndicator } from 'src/shared/http/health/memory.health';

@Controller('health')
export class HealthReadyController {
  constructor(
    private readonly database: DatabaseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly integrations: IntegrationHealthIndicator,
  ) {}

  @Get('ready')
  @Public()
  async handle(@Res() res: FastifyReply): Promise<FastifyReply> {
    const [database, memory] = [
      await this.database.ping(),
      this.memory.check(),
    ];
    const checks = {
      database,
      memory,
      integrations: this.integrations.check(),
    };

    const down = Object.entries({ database, memory })
      .filter(([, check]) => check.status === 'down')
      .map(([name]) => name);

    if (down.length > 0) {
      throw new ServiceUnavailableException(
        `Dependências indisponíveis: ${down.join(', ')}`,
      );
    }

    return res.status(200).send({ status: 'ok', checks });
  }
}
