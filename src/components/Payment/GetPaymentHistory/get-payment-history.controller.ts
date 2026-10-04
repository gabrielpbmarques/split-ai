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

import { GetPaymentHistoryQueryDto } from './get-payment-history.dto';
import { GetPaymentHistoryService } from './get-payment-history.service';

@Controller('payment')
export class GetPaymentHistoryController {
  constructor(
    private readonly getPaymentHistoryService: GetPaymentHistoryService,
  ) {}

  @Get('history')
  @UseGuards(AuthGuard)
  async handle(
    @Res() res: FastifyReply,
    @UserDecorator() user: User,
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
