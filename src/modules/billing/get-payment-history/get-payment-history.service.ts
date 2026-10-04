import { Injectable, BadRequestException } from '@nestjs/common';

import { PaymentEntity } from 'src/infrastructure/database/schema';
import { PaymentRepository } from 'src/modules/billing/repositories/payment.repository';

@Injectable()
export class GetPaymentHistoryService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(
    organizationId: string,
    limit = 50,
    offset = 0,
  ): Promise<PaymentEntity[]> {
    if (!organizationId) {
      throw new BadRequestException('Organization not found');
    }

    return this.paymentRepository.findByOrganizationId(
      organizationId,
      limit,
      offset,
    );
  }
}
