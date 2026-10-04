import { Module } from '@nestjs/common';

import { CreateCheckoutModule } from 'src/modules/billing/create-checkout/create-checkout.module';
import { GetCreditTransactionsModule } from 'src/modules/billing/get-credit-transactions/get-credit-transactions.module';
import { GetCreditsModule } from 'src/modules/billing/get-credits/get-credits.module';
import { GetPaymentHistoryModule } from 'src/modules/billing/get-payment-history/get-payment-history.module';
import { GetPlansModule } from 'src/modules/billing/get-plans/get-plans.module';
import { GetStripePublicKeyModule } from 'src/modules/billing/get-stripe-public-key/get-stripe-public-key.module';
import { GetTokenUsageModule } from 'src/modules/billing/get-token-usage/get-token-usage.module';
import { ManageCreditsModule } from 'src/modules/billing/manage-credits/manage-credits.module';
import { RecordTokenUsageModule } from 'src/modules/billing/record-token-usage/record-token-usage.module';
import { StripeWebhookModule } from 'src/modules/billing/stripe-webhook/stripe-webhook.module';

@Module({
  imports: [
    CreateCheckoutModule,
    GetCreditTransactionsModule,
    GetCreditsModule,
    GetPaymentHistoryModule,
    GetPlansModule,
    GetStripePublicKeyModule,
    GetTokenUsageModule,
    ManageCreditsModule,
    RecordTokenUsageModule,
    StripeWebhookModule,
  ],
  exports: [
    CreateCheckoutModule,
    GetCreditTransactionsModule,
    GetCreditsModule,
    GetPaymentHistoryModule,
    GetPlansModule,
    GetStripePublicKeyModule,
    GetTokenUsageModule,
    ManageCreditsModule,
    RecordTokenUsageModule,
    StripeWebhookModule,
  ],
})
export class BillingModule {}
