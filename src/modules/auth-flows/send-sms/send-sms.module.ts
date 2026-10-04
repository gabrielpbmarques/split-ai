import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { TwilioProviderModule } from 'src/infrastructure/twilio/twilio.provider.module';
import { GenerateTokenModule } from 'src/modules/auth-flows/generate-token/generate-token.module';
import { SmsVerificationRepositoryModule } from 'src/modules/auth-flows/repositories/sms-verification.repository.module';
import { SendSmsController } from 'src/modules/auth-flows/send-sms/send-sms.controller';
import { SendSmsService } from 'src/modules/auth-flows/send-sms/send-sms.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

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
