import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { CreateApiKeyDto } from './create-api-key.dto';
import { CreateApiKeyService } from './create-api-key.service';

@Controller('api-key')
export class CreateApiKeyController {
  constructor(private readonly createApiKeyService: CreateApiKeyService) {}

  @Post('create')
  @RequirePermissions('api-key.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: CreateApiKeyDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.createApiKeyService.execute(
      dto,
      user.organization_id,
      user.id ?? null,
    );
    return res.status(201).send(result);
  }
}
