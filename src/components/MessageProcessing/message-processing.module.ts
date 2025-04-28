import { Module } from '@nestjs/common';
import { ProcessMessageDataModule } from './ProcessMessageData/process-message-data.module';

@Module({
  imports: [ProcessMessageDataModule],
  exports: [ProcessMessageDataModule],
})
export class MessageProcessingModule {}
