import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { CreateApiKeyDto } from 'src/modules/api-keys/create-api-key/create-api-key.dto';
import { CreateApiKeyService } from 'src/modules/api-keys/create-api-key/create-api-key.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

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
