import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrgRoleGuard } from 'src/auth/org-role.guard';
import { OrgRoles } from 'src/decorators/org-roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { ListAgentConnectionsDto } from './list-agent-connections.dto';
import { ListAgentConnectionsService } from './list-agent-connections.service';

@Controller('agent-connection')
export class ListAgentConnectionsController {
  constructor(
    private readonly listAgentConnectionsService: ListAgentConnectionsService,
  ) {}

  @Post('list')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin', 'member')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: ListAgentConnectionsDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.listAgentConnectionsService.execute(
        dto.principalAgentId,
        user,
      );
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
