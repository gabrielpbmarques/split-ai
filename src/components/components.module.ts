import { Module } from '@nestjs/common';
import { AuthModule } from 'src/components/Auth/auth.module';
import { SessionModule } from 'src/components/Session/session.module';

import { AIChatModule } from './AIChat/ai-chat.module';
import { ArtificialIntelligenceModule } from './ArtificialIntelligence/artificial-intelligence.module';
import { OcrModule } from './OCR/ocr.module';
import { OrganizationModule } from './Organization/organization.module';
import { PdfModule } from './Pdf/pdf.module';
import { PublicChatModule } from './PublicChat/public-chat.module';
import { PublicEmbedModule } from './PublicEmbed/public-embed.module';
import { RegisterModule } from './Register/register.module';
import { ReportModule } from './Report/report.module';
import { UserModule } from './User/user.module';

@Module({
  imports: [
    AuthModule,
    SessionModule,
    AIChatModule,
    ArtificialIntelligenceModule,
    OcrModule,
    PdfModule,
    RegisterModule,
    ReportModule,
    OrganizationModule,
    PublicEmbedModule,
    PublicChatModule,
    UserModule,
  ],
  exports: [
    AuthModule,
    SessionModule,
    AIChatModule,
    ArtificialIntelligenceModule,
    OcrModule,
    PdfModule,
    RegisterModule,
    ReportModule,
    OrganizationModule,
    PublicEmbedModule,
    PublicChatModule,
    UserModule,
  ],
})
export class ComponentsModule {}
