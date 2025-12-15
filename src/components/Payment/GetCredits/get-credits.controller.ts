import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { GetCreditsService } from './get-credits.service';

@Controller('payment')
export class GetCreditsController {
  constructor(private readonly getCreditsService: GetCreditsService) {}

  @Get('credits')
  @UseGuards(AuthGuard)
  async handle(@Res() res: FastifyReply, @UserDecorator() user: User) {
    try {
      const data = await this.getCreditsService.execute(user.organization_id);
      return res.status(200).send(data);
    } catch (error) {
      const status = (error && (error.status || error.statusCode)) || 500;
      return res.status(status).send(error.message || 'Internal server error');
    }
  }
}
