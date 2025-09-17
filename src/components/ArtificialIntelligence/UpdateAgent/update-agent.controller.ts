import { Body, Controller, Get, Param, Patch, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Roles } from 'src/decorators/roles.decorator';
import { UpdateAgentService } from './update-agent.service';
import { UpdateAgentDto } from './update-agent.dto';

@Controller('agent')
export class UpdateAgentController {
  constructor(private readonly updateAgentService: UpdateAgentService) {}

  @Get()
  @Roles('admin')
  async list(@Res() res: FastifyReply): Promise<FastifyReply> {
    try {
      const data = await this.updateAgentService.list();
      return res.status(200).send({ data });
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }

  @Get(':id')
  @Roles('admin')
  async getOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const data = await this.updateAgentService.getOne(id);
      return res.status(200).send({ data });
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const data = await this.updateAgentService.update(id, dto);
      return res.status(200).send({ data });
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
