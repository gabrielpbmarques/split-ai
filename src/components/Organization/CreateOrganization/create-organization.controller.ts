import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { CreateOrganizationDto } from './create-organization.dto';
import { CreateOrganizationService } from './create-organization.service';

@Controller('organization')
export class CreateOrganizationController {
  constructor(
    private readonly createOrganizationService: CreateOrganizationService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: CreateOrganizationDto,
    @AuthUser() user: User,
  ) {
    try {
      const result = await this.createOrganizationService.execute(dto, user);
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
}
