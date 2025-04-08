import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { WhatsappMessageController } from './whatsapp-message.controller';
import { WhatsappMessageService } from './whatsapp-message.service';
import { GenerateAiResponseModule } from '../Common/generate-ai-response.module';
import { LoadAiChatModule } from '../../Langchain/LoadAiChat/load-ai-chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Worker.name, schema: WorkerSchema }]),
    GenerateAiResponseModule,
    LoadAiChatModule,
  ],
  controllers: [WhatsappMessageController],
  providers: [WhatsappMessageService],
  exports: [WhatsappMessageService],
})
export class WhatsappMessageModule {}
