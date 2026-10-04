import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetOrganizationService } from 'src/modules/organizations/get-organization/get-organization.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('organizations')
@Controller('organization')
export class GetOrganizationController {
  constructor(
    private readonly getOrganizationService: GetOrganizationService,
  ) {}

  @Get(':id')
  @RequirePermissions('organization.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Res() res: FastifyReply, @Param('id') id: string) {
    const result = await this.getOrganizationService.execute(id);
    return res.status(200).send(result);
  }
}
