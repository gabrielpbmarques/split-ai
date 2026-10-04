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
import { GetCreditTransactionsQueryDto } from 'src/modules/billing/get-credit-transactions/get-credit-transactions.dto';
import { GetCreditTransactionsService } from 'src/modules/billing/get-credit-transactions/get-credit-transactions.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';

@ApiTags('billing')
@Controller('payment')
export class GetCreditTransactionsController {
  constructor(
    private readonly getCreditTransactionsService: GetCreditTransactionsService,
  ) {}

  @Get('transactions')
  @RequirePermissions('account.access')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @UserDecorator() user: AuthenticatedUser,
    @Query()
    query: GetCreditTransactionsQueryDto,
  ) {
    const result = await this.getCreditTransactionsService.execute(
      requireOrganizationId(user),
      query,
    );
    return res.status(200).send(result);
  }
}
