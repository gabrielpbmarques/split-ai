import { Module } from '@nestjs/common';

import { CheckUserRegisteredModule } from './CheckUserRegistered/check-user-registered.module';
import { GenerateTokenModule } from './GenerateToken/generate-token.module';
import { LoginModule } from './Login/login.module';
import { RegisterLiteModule } from './RegisterLite/register-lite.module';
import { SendSmsModule } from './SendSms/send-sms.module';

@Module({
  imports: [
    GenerateTokenModule,
    LoginModule,
    SendSmsModule,
    CheckUserRegisteredModule,
    RegisterLiteModule,
  ],
})
export class AuthModule {}
