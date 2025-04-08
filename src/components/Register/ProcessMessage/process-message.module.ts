import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { ProcessMessageController } from './process-message.controller';
import { ProcessMessageService } from './process-message.service';
import { GenerateAiResponseModule } from '../Common/generate-ai-response.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Worker.name, schema: WorkerSchema }]),
    GenerateAiResponseModule,
  ],
  controllers: [ProcessMessageController],
  providers: [ProcessMessageService],
  exports: [ProcessMessageService],
})
export class ProcessMessageModule {}
