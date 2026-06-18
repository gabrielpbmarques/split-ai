import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { GetProfileService } from './get-profile.service';

@Controller('profile')
export class GetProfileController {
  constructor(private readonly getProfileService: GetProfileService) {}

  @Get()
  @UseGuards(AuthGuard)
  async handle(
    @Res() res: FastifyReply,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.getProfileService.execute(user.id);
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
