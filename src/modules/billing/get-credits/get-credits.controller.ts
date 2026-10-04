import { Controller, Get, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetCreditsService } from 'src/modules/billing/get-credits/get-credits.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';

@ApiTags('billing')
@Controller('payment')
export class GetCreditsController {
  constructor(private readonly getCreditsService: GetCreditsService) {}

  @Get('credits')
  @RequirePermissions('account.access')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @UserDecorator() user: AuthenticatedUser,
  ) {
    const data = await this.getCreditsService.execute(user.organization_id);
    return res.status(200).send(data);
  }
}
