import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { GetOrganizationService } from './get-organization.service';

@Controller('organization')
export class GetOrganizationController {
  constructor(
    private readonly getOrganizationService: GetOrganizationService,
  ) {}

  @Get(':id')
  @RequirePermissions('organization.read')
  async handle(@Res() res: FastifyReply, @Param('id') id: string) {
    const result = await this.getOrganizationService.execute(id);
    return res.status(200).send(result);
  }
}
