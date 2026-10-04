import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { SmsVerificationRepositoryModule } from 'src/modules/auth-flows/repositories/sms-verification.repository.module';
import { SendSmsController } from 'src/modules/auth-flows/send-sms/send-sms.controller';
import { SendSmsService } from 'src/modules/auth-flows/send-sms/send-sms.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    SmsVerificationRepositoryModule,
    UserRepositoryModule,
  ],
  controllers: [SendSmsController],
  providers: [SendSmsService],
  exports: [SendSmsService],
})
export class SendSmsModule {}
