import { Module } from '@nestjs/common';

import { GenerateTokenModule } from 'src/modules/auth-flows/generate-token/generate-token.module';
import { LoginModule } from 'src/modules/auth-flows/login/login.module';

@Module({
  imports: [GenerateTokenModule, LoginModule],
  exports: [GenerateTokenModule, LoginModule],
})
export class AuthFlowsModule {}
