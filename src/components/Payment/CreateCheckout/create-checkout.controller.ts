import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { CreateCheckoutDto } from './create-checkout.dto';
import { CreateCheckoutService } from './create-checkout.service';

@Controller('payment')
export class CreateCheckoutController {
  constructor(private readonly createCheckoutService: CreateCheckoutService) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  async handle(
    @Body(new ValidationPipe()) dto: CreateCheckoutDto,
    @Res() res: FastifyReply,
    @UserDecorator() user: User,
  ) {
    try {
      const organizationId =
        user.role === 'admin'
          ? dto.organizationId || user.organization_id
          : user.organization_id;

      if (!organizationId) {
        throw new BadRequestException('Organization ID is required');
      }

      const successUrl =
        dto.successUrl || `${process.env.FRONTEND_URL}/payment/success`;
      const cancelUrl =
        dto.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`;

      const result = await this.createCheckoutService.execute({
        organizationId,
        planType: dto.planType,
        successUrl,
        cancelUrl,
      });

      return res.status(200).send(result);
    } catch (error) {
      const status = (error && (error.status || error.statusCode)) || 500;
      return res
        .status(status)
        .send(error.message || 'Failed to create checkout session');
    }
  }
}
