import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListOrganizationsDto } from 'src/modules/organizations/list-organizations/list-organizations.dto';
import { ListOrganizationsService } from 'src/modules/organizations/list-organizations/list-organizations.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('organizations')
@Controller('organization')
export class ListOrganizationsController {
  constructor(
    private readonly listOrganizationsService: ListOrganizationsService,
  ) {}

  @Get()
  @RequirePermissions('organization.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Query() query: ListOrganizationsDto, @Res() res: FastifyReply) {
    const result = await this.listOrganizationsService.execute(query);
    return res.status(200).send(result);
  }
}
