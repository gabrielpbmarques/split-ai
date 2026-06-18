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

import { RevokeApiKeyDto } from './revoke-api-key.dto';
import { RevokeApiKeyService } from './revoke-api-key.service';

@Controller('api-key')
export class RevokeApiKeyController {
  constructor(private readonly revokeApiKeyService: RevokeApiKeyService) {}

  @Post('revoke')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: RevokeApiKeyDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.revokeApiKeyService.execute(
        dto,
        user.organization_id,
      );
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
