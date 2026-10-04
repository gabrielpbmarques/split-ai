import { Module } from '@nestjs/common';

import { CheckUserRegisteredModule } from 'src/modules/auth-flows/check-user-registered/check-user-registered.module';
import { GenerateTokenModule } from 'src/modules/auth-flows/generate-token/generate-token.module';
import { LoginModule } from 'src/modules/auth-flows/login/login.module';
import { RegisterLiteModule } from 'src/modules/auth-flows/register-lite/register-lite.module';
import { SendSmsModule } from 'src/modules/auth-flows/send-sms/send-sms.module';
import { SignUpModule } from 'src/modules/auth-flows/sign-up/sign-up.module';

@Module({
  imports: [
    CheckUserRegisteredModule,
    GenerateTokenModule,
    LoginModule,
    RegisterLiteModule,
    SendSmsModule,
    SignUpModule,
  ],
  exports: [
    CheckUserRegisteredModule,
    GenerateTokenModule,
    LoginModule,
    RegisterLiteModule,
    SendSmsModule,
    SignUpModule,
  ],
})
export class AuthFlowsModule {}
