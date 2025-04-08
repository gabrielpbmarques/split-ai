import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { StartRegistrationController } from './start-registration.controller';
import { StartRegistrationService } from './start-registration.service';
import { GenerateAiResponseModule } from '../Common/generate-ai-response.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Worker.name, schema: WorkerSchema }]),
    GenerateAiResponseModule,
  ],
  controllers: [StartRegistrationController],
  providers: [StartRegistrationService],
  exports: [StartRegistrationService],
})
export class StartRegistrationModule {}
