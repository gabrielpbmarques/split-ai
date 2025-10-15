import { Controller, Get, Res, UseGuards } from '@nestjs/common';
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
  async handle(@Res() res: FastifyReply) {
    try {
      const result = await this.listOrganizationsService.execute();
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
}
