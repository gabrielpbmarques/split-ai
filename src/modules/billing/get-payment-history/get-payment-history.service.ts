import { BadRequestException, Injectable } from '@nestjs/common';

import { PaymentEntity } from 'src/infrastructure/database/schema';
import { GetPaymentHistoryQueryDto } from 'src/modules/billing/get-payment-history/get-payment-history.dto';
import { PaymentRepository } from 'src/modules/billing/repositories/payment.repository';
import {
  PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

@Injectable()
export class GetPaymentHistoryService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(
    organizationId: string,
    dto: GetPaymentHistoryQueryDto,
  ): Promise<PaginatedResponse<PaymentEntity>> {
    if (!organizationId) {
      throw new BadRequestException('Organização não encontrada');
    }

    const page = await this.paymentRepository.listByOrganizationPaginated(
      organizationId,
      dto,
    );
    return toPaginatedResponse(page, dto);
  }
}
