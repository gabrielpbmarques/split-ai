import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { GenerateTokenModule } from 'src/modules/auth-flows/generate-token/generate-token.module';
import { SmsVerificationRepositoryModule } from 'src/modules/auth-flows/repositories/sms-verification.repository.module';
import { VerifySmsController } from 'src/modules/auth-flows/verify-sms/verify-sms.controller';
import { VerifySmsService } from 'src/modules/auth-flows/verify-sms/verify-sms.service';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    GenerateTokenModule,
    SmsVerificationRepositoryModule,
    UserRepositoryModule,
  ],
  controllers: [VerifySmsController],
  providers: [VerifySmsService],
  exports: [VerifySmsService],
})
export class VerifySmsModule {}
