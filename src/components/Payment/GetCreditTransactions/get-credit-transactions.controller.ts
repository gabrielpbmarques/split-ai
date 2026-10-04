import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { GetCreditTransactionsQueryDto } from './get-credit-transactions.dto';
import { GetCreditTransactionsService } from './get-credit-transactions.service';

@Controller('payment')
export class GetCreditTransactionsController {
  constructor(
    private readonly getCreditTransactionsService: GetCreditTransactionsService,
  ) {}

  @Get('transactions')
  @UseGuards(AuthGuard)
  async handle(
    @Res() res: FastifyReply,
    @UserDecorator() user: User,
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
