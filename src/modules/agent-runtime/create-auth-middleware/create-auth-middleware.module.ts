import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { CreateAuthMiddlewareService } from 'src/modules/agent-runtime/create-auth-middleware/create-auth-middleware.service';

@Module({
  imports: [AuthModule],
  providers: [CreateAuthMiddlewareService],
  exports: [CreateAuthMiddlewareService],
})
export class CreateAuthMiddlewareModule {}
