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

import { DeleteAgentConnectionDto } from './delete-agent-connection.dto';
import { DeleteAgentConnectionService } from './delete-agent-connection.service';

@Controller('agent-connection')
export class DeleteAgentConnectionController {
  constructor(
    private readonly deleteAgentConnectionService: DeleteAgentConnectionService,
  ) {}

  @Post('delete')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin', 'member')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: DeleteAgentConnectionDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.deleteAgentConnectionService.execute(
        dto.id,
        user,
      );
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
