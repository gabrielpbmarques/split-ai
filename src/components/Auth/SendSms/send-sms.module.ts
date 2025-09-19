import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { SendSmsController } from './send-sms.controller';
import { SendSmsService } from './send-sms.service';

@Module({
  imports: [RepositoriesModule, InfrastructureModule],
  controllers: [SendSmsController],
  providers: [SendSmsService],
})
export class SendSmsModule {}
