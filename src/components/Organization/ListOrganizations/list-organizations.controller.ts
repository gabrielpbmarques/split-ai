import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { ListOrganizationsService } from './list-organizations.service';

@Controller('organization')
export class ListOrganizationsController {
  constructor(
    private readonly listOrganizationsService: ListOrganizationsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin')
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
    try {
      const result = await this.listOrganizationsService.execute(query);
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(500).send(error);
    }
  }
}
