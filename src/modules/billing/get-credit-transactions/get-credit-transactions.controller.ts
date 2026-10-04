import { Controller, Get, Query, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetCreditTransactionsQueryDto } from 'src/modules/billing/get-credit-transactions/get-credit-transactions.dto';
import { GetCreditTransactionsService } from 'src/modules/billing/get-credit-transactions/get-credit-transactions.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';

@Controller('payment')
export class GetCreditTransactionsController {
  constructor(
    private readonly getCreditTransactionsService: GetCreditTransactionsService,
  ) {}

  @Get('transactions')
  @RequirePermissions('account.access')
  async handle(
    @Res() res: FastifyReply,
    @UserDecorator() user: AuthenticatedUser,
    @Query(new ValidationPipe({ transform: true }))
    query: GetCreditTransactionsQueryDto,
  ) {
    const transactions = await this.getCreditTransactionsService.execute(
      user.organization_id,
      query.limit ?? 100,
      query.offset ?? 0,
    );

    return res.status(200).send(transactions);
  }
}
