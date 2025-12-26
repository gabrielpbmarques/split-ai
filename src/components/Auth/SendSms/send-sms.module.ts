import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GenerateTokenModule } from '../GenerateToken/generate-token.module';

import { SendSmsController } from './send-sms.controller';
import { SendSmsService } from './send-sms.service';

@Module({
  imports: [RepositoriesModule, InfrastructureModule, GenerateTokenModule],
  controllers: [SendSmsController],
  providers: [SendSmsService],
})
export class SendSmsModule {}

// https://02b2f2df9342.ngrok-free.app/public/chat/acc95027-f4b5-4c2a-9ee8-8246d504740f
