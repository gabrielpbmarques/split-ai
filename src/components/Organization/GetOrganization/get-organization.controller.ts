import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { GetOrganizationService } from './get-organization.service';

@Controller('organization')
export class GetOrganizationController {
  constructor(
    private readonly getOrganizationService: GetOrganizationService,
  ) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(@Res() res: FastifyReply, @Param('id') id: string) {
    const result = await this.getOrganizationService.execute(id);
    return res.status(200).send(result);
  }
}
