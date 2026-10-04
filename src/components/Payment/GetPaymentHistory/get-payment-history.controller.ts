import { Controller, Get, Query, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';

import { GetPaymentHistoryQueryDto } from './get-payment-history.dto';
import { GetPaymentHistoryService } from './get-payment-history.service';

@Controller('payment')
export class GetPaymentHistoryController {
  constructor(
    private readonly getPaymentHistoryService: GetPaymentHistoryService,
  ) {}

  @Get('history')
  @RequirePermissions('account.access')
  async handle(
    @Res() res: FastifyReply,
    @UserDecorator() user: AuthenticatedUser,
    @Query(new ValidationPipe({ transform: true }))
    query: GetPaymentHistoryQueryDto,
  ) {
    const payments = await this.getPaymentHistoryService.execute(
      user.organization_id,
      query.limit ?? 50,
      query.offset ?? 0,
    );
    return res.status(200).send(payments);
  }
}
