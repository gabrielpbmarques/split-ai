import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { requireOrganizationId } from 'src/auth/request-user';
import { GetPaymentHistoryQueryDto } from 'src/modules/billing/get-payment-history/get-payment-history.dto';
import { GetPaymentHistoryService } from 'src/modules/billing/get-payment-history/get-payment-history.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';

@ApiTags('billing')
@Controller('payment')
export class GetPaymentHistoryController {
  constructor(
    private readonly getPaymentHistoryService: GetPaymentHistoryService,
  ) {}

  @Get('history')
  @RequirePermissions('account.access')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @UserDecorator() user: AuthenticatedUser,
    @Query()
    query: GetPaymentHistoryQueryDto,
  ) {
    const result = await this.getPaymentHistoryService.execute(
      requireOrganizationId(user),
      query,
    );
    return res.status(200).send(result);
  }
}
