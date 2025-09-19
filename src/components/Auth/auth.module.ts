import { Module } from '@nestjs/common';

import { GenerateTokenModule } from './GenerateToken/generate-token.module';
import { LoginModule } from './Login/login.module';
import { SendSmsModule } from './SendSms/send-sms.module';

@Module({
  imports: [GenerateTokenModule, LoginModule, SendSmsModule],
  exports: [GenerateTokenModule, LoginModule, SendSmsModule],
})
export class AuthModule {}
