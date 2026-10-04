import {
  Body,
  Controller,
  Post,
  Res,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { CreateCheckoutDto } from 'src/modules/billing/create-checkout/create-checkout.dto';
import { CreateCheckoutService } from 'src/modules/billing/create-checkout/create-checkout.service';
import { env } from 'src/shared/config/env';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';

@ApiTags('billing')
@Controller('payment')
export class CreateCheckoutController {
  constructor(private readonly createCheckoutService: CreateCheckoutService) {}

  @Post('checkout')
  @RequirePermissions('account.access')
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Body() dto: CreateCheckoutDto,
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

    return res.status(201).send(result);
  }
}
