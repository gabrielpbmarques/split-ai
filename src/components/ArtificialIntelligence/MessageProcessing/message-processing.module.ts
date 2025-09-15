import { Module } from '@nestjs/common';
import { ProcessMessageDataModule } from 'src/components/ArtificialIntelligence/MessageProcessing/ProcessMessageData/process-message-data.module';

@Module({
  imports: [ProcessMessageDataModule],
  exports: [ProcessMessageDataModule],
})
export class MessageProcessingModule {}
