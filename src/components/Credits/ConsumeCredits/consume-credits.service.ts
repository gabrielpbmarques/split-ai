import { Injectable } from '@nestjs/common';
import { TransactionType } from 'src/entities/credit-transaction.entity';
import { CreditBalanceRepository } from 'src/repositories/credit-balance.repository';

import { ManageCreditsService } from '../ManageCredits/manage-credits.service';

@Injectable()
export class ConsumeCreditsService {
  private readonly CREDITS_PER_MESSAGE = 1;
  private readonly CREDITS_PER_AI_RESPONSE = 3;

  constructor(
    private readonly manageCreditsService: ManageCreditsService,
    private readonly creditBalanceRepository: CreditBalanceRepository,
  ) {}

  async execute(
    organizationId: string,
    sessionId: string,
    isAiResponse: boolean = true,
  ): Promise<boolean> {
    try {
      // Calculate credits to consume
      const creditsToConsume = isAiResponse
        ? this.CREDITS_PER_MESSAGE + this.CREDITS_PER_AI_RESPONSE
        : this.CREDITS_PER_MESSAGE;

      // Check if organization has enough credits
      const hasCredits = await this.creditBalanceRepository.hasEnoughCredits(
        organizationId,
        creditsToConsume,
      );

      if (!hasCredits) {
        return false;
      }

      // Consume credits
      await this.manageCreditsService.execute(
        organizationId,
        creditsToConsume,
        TransactionType.CONSUMPTION,
        `Consumo de chat AI - Sessão ${sessionId}`,
        {
          sessionId,
          isAiResponse,
          creditsConsumed: creditsToConsume,
        },
      );

      return true;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  }

  async checkCredits(organizationId: string): Promise<boolean> {
    const minCreditsRequired =
      this.CREDITS_PER_MESSAGE + this.CREDITS_PER_AI_RESPONSE;
    return this.creditBalanceRepository.hasEnoughCredits(
      organizationId,
      minCreditsRequired,
    );
  }

  async getAvailableCredits(organizationId: string): Promise<number> {
    return this.creditBalanceRepository.getAvailableCredits(organizationId);
  }
}
