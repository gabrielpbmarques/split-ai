import { Module } from '@nestjs/common';

import { SignUpModule } from './SignUp/sign-up.module';

@Module({
  imports: [SignUpModule],
  exports: [SignUpModule],
})
export class RegisterModule {}
