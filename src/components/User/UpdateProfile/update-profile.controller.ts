import {
  Body,
  Controller,
  Patch,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { UpdateProfileDto } from './update-profile.dto';
import { UpdateProfileService } from './update-profile.service';

@Controller('profile')
export class UpdateProfileController {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Patch()
  @UseGuards(AuthGuard)
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: UpdateProfileDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.updateProfileService.execute(user.id, dto);
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
