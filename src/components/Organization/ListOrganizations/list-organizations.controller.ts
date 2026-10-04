import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { ListOrganizationsService } from './list-organizations.service';

@Controller('organization')
export class ListOrganizationsController {
  constructor(
    private readonly listOrganizationsService: ListOrganizationsService,
  ) {}

  @Get()
  @RequirePermissions('organization.manage')
  async handle(
    @Query()
    query: {
      name?: string;
      acronym?: string;
      email_domain?: string;
      contact_name?: string;
      contact_email?: string;
      status?: string;
      plan?: string;
      activated_at?: string;
    },
    @Res() res: FastifyReply,
  ) {
    const result = await this.listOrganizationsService.execute(query);
    return res.status(200).send(result);
  }
}
