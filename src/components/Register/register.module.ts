import { Module } from '@nestjs/common';

import { SignUpModule } from './SignUp/sign-up.module';

@Module({
  imports: [SignUpModule],
})
export class RegisterModule {}
