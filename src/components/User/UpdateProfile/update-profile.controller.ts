import { Body, Controller, Patch, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { UpdateProfileDto } from './update-profile.dto';
import { UpdateProfileService } from './update-profile.service';

@Controller('profile')
export class UpdateProfileController {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Patch()
  @RequirePermissions('account.access')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: UpdateProfileDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.updateProfileService.execute(user.id, dto);
    return res.status(200).send(result);
  }
}
