import { Body, Controller, Patch, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { requireUserId } from 'src/auth/request-user';
import { UpdateProfileDto } from 'src/modules/users/update-profile/update-profile.dto';
import { UpdateProfileService } from 'src/modules/users/update-profile/update-profile.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('users')
@Controller('profile')
export class UpdateProfileController {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Patch()
  @RequirePermissions('account.access')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: UpdateProfileDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.updateProfileService.execute(
      requireUserId(user),
      dto,
    );
    return res.status(200).send(result);
  }
}
