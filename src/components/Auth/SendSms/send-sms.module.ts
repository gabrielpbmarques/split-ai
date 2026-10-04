import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TwilioProviderModule } from 'src/infrastructure/providers/twilio.provider.module';
import { SmsVerificationRepositoryModule } from 'src/repositories/sms-verification.repository.module';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { GenerateTokenModule } from '../GenerateToken/generate-token.module';

import { SendSmsController } from './send-sms.controller';
import { SendSmsService } from './send-sms.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    GenerateTokenModule,
    SmsVerificationRepositoryModule,
    TwilioProviderModule,
    UserRepositoryModule,
  ],
  controllers: [SendSmsController],
  providers: [SendSmsService],
})
export class SendSmsModule {}
