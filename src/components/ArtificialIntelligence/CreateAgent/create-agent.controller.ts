import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Roles } from 'src/decorators/roles.decorator';

import { CreateAgentDto } from './create-agent.dto';
import { CreateAgentService } from './create-agent.service';

@Controller('agent')
export class CreateAgentController {
  constructor(private readonly createAgentService: CreateAgentService) {}

  @Post('create')
  @Roles('admin')
  async execute(
    @Body() dto: CreateAgentDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const result = await this.createAgentService.execute(dto);
      return res.status(201).send(result);
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
