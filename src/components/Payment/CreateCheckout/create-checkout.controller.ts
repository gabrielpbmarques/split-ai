import {
  Body,
  Controller,
  Post,
  Res,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { env } from 'src/shared/config/env';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';

import { CreateCheckoutDto } from './create-checkout.dto';
import { CreateCheckoutService } from './create-checkout.service';

@Controller('payment')
export class CreateCheckoutController {
  constructor(private readonly createCheckoutService: CreateCheckoutService) {}

  @Post('checkout')
  @RequirePermissions('account.access')
  async handle(
    @Body(new ValidationPipe()) dto: CreateCheckoutDto,
    @Res() res: FastifyReply,
    @UserDecorator() user: AuthenticatedUser,
  ) {
    const organizationId =
      user.role === 'admin'
        ? dto.organizationId || user.organization_id
        : user.organization_id;

    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    const successUrl = dto.successUrl || `${env.FRONTEND_URL}/payment/success`;
    const cancelUrl = dto.cancelUrl || `${env.FRONTEND_URL}/payment/cancel`;

    const result = await this.createCheckoutService.execute({
      organizationId,
      planType: dto.planType,
      successUrl,
      cancelUrl,
    });

    return res.status(200).send(result);
  }
}
