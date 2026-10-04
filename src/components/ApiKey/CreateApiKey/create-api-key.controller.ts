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

import { CreateApiKeyDto } from './create-api-key.dto';
import { CreateApiKeyService } from './create-api-key.service';

@Controller('api-key')
export class CreateApiKeyController {
  constructor(private readonly createApiKeyService: CreateApiKeyService) {}

  @Post('create')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: CreateApiKeyDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    const result = await this.createApiKeyService.execute(
      dto,
      user.organization_id,
      user.id ?? null,
    );
    return res.status(201).send(result);
  }
}
