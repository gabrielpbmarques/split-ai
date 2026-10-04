import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { CreateOrganizationDto } from 'src/modules/organizations/create-organization/create-organization.dto';
import { CreateOrganizationService } from 'src/modules/organizations/create-organization/create-organization.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('organizations')
@Controller('organization')
export class CreateOrganizationController {
  constructor(
    private readonly createOrganizationService: CreateOrganizationService,
  ) {}

  @Post()
  @RequirePermissions('organization.manage')
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: CreateOrganizationDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const result = await this.createOrganizationService.execute(dto, user);
    return res.status(201).send(result);
  }
}
