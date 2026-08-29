import { Module } from '@nestjs/common';
import { AuthModule } from 'src/components/Auth/auth.module';
import { SessionModule } from 'src/components/Session/session.module';

import { AgentConnectionModule } from './AgentConnection/agent-connection.module';
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
import { LoadAgentToolsModule } from './Tools/LoadAgentTools/load-agent-tools.module';
import { MaybeLoadDatabaseToolModule } from './Tools/MaybeLoadDatabaseTool/maybe-load-database-tool.module';
import { UserModule } from './User/user.module';
import { WhatsappModule } from './Whatsapp/whatsapp.module';

@Module({
  imports: [
    AuthModule,
    SessionModule,
    AIChatModule,
    LoadAgentToolsModule,
    MaybeLoadDatabaseToolModule,
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
    AgentConnectionModule,
  ],
})
export class ComponentsModule {}
