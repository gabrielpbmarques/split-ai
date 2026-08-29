import { Module } from '@nestjs/common';
import { TwilioProviderModule } from 'src/infrastructure/providers/twilio.provider.module';
import { SmsVerificationRepositoryModule } from 'src/repositories/sms-verification.repository.module';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { GenerateTokenModule } from '../GenerateToken/generate-token.module';

import { SendSmsController } from './send-sms.controller';
import { SendSmsService } from './send-sms.service';

@Module({
  imports: [
    GenerateTokenModule,
    SmsVerificationRepositoryModule,
    TwilioProviderModule,
    UserRepositoryModule,
  ],
  controllers: [SendSmsController],
  providers: [SendSmsService],
})
export class SendSmsModule {}

// https://02b2f2df9342.ngrok-free.app/public/chat/acc95027-f4b5-4c2a-9ee8-8246d504740f
