import { Module } from '@nestjs/common';
import { AuthModule } from 'src/components/Auth/auth.module';
import { SessionModule } from 'src/components/Session/session.module';

import { AIChatModule } from './AIChat/ai-chat.module';
import { AnalyticsModule } from './Analytics/analytics.module';
import { ApiKeyModule } from './ApiKey/api-key.module';
import { ArtificialIntelligenceModule } from './ArtificialIntelligence/artificial-intelligence.module';
import { DashboardModule } from './Dashboard/dashboard.module';
import { OcrModule } from './OCR/ocr.module';
import { OrganizationModule } from './Organization/organization.module';
import { PaymentModule } from './Payment/payment.module';
import { PdfModule } from './Pdf/pdf.module';
import { RegisterModule } from './Register/register.module';
import { ReportModule } from './Report/report.module';
import { SourceModule } from './Source/source.module';
import { UserModule } from './User/user.module';
import { WhatsappModule } from './Whatsapp/whatsapp.module';

@Module({
  imports: [
    AuthModule,
    SessionModule,
    AIChatModule,
    ArtificialIntelligenceModule,
    DashboardModule,
    OcrModule,
    PaymentModule,
    PdfModule,
    RegisterModule,
    ReportModule,
    OrganizationModule,
    UserModule,
    WhatsappModule,
    AnalyticsModule,
    SourceModule,
    ApiKeyModule,
  ],
  exports: [
    AuthModule,
    SessionModule,
    AIChatModule,
    ArtificialIntelligenceModule,
    DashboardModule,
    OcrModule,
    PaymentModule,
    PdfModule,
    RegisterModule,
    ReportModule,
    OrganizationModule,
    UserModule,
    WhatsappModule,
    AnalyticsModule,
    SourceModule,
    ApiKeyModule,
  ],
})
export class ComponentsModule {}
