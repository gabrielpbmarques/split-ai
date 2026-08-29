import { Module } from '@nestjs/common';

import { CreateCheckoutModule } from './CreateCheckout/create-checkout.module';
import { GetCreditsModule } from './GetCredits/get-credits.module';
import { GetCreditTransactionsModule } from './GetCreditTransactions/get-credit-transactions.module';
import { GetPaymentHistoryModule } from './GetPaymentHistory/get-payment-history.module';
import { GetPlansModule } from './GetPlans/get-plans.module';
import { GetStripePublicKeyModule } from './GetStripePublicKey/get-stripe-public-key.module';
import { StripeWebhookModule } from './StripeWebhook/stripe-webhook.module';

@Module({
  imports: [
    CreateCheckoutModule,
    StripeWebhookModule,
    GetPlansModule,
    GetCreditsModule,
    GetPaymentHistoryModule,
    GetCreditTransactionsModule,
    GetStripePublicKeyModule,
  ],
})
export class PaymentModule {}
