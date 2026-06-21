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

import { SaveAgentConnectionLayoutDto } from './save-agent-connection-layout.dto';
import { SaveAgentConnectionLayoutService } from './save-agent-connection-layout.service';

@Controller('agent-connection')
export class SaveAgentConnectionLayoutController {
  constructor(
    private readonly saveAgentConnectionLayoutService: SaveAgentConnectionLayoutService,
  ) {}

  @Post('layout')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin', 'member')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: SaveAgentConnectionLayoutDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.saveAgentConnectionLayoutService.execute(
        dto,
        user,
      );
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
