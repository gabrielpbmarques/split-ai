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

import { UpdateAgentConnectionDto } from './update-agent-connection.dto';
import { UpdateAgentConnectionService } from './update-agent-connection.service';

@Controller('agent-connection')
export class UpdateAgentConnectionController {
  constructor(
    private readonly updateAgentConnectionService: UpdateAgentConnectionService,
  ) {}

  @Post('update')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin', 'member')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: UpdateAgentConnectionDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.updateAgentConnectionService.execute(
        dto,
        user.organization_id,
      );
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
