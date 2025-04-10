import { Module } from '@nestjs/common';
import { UpdateLastAiResponseService } from './update-last-ai-response.service';
import { SessionRepository } from 'src/repositories/Session.repository';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from 'src/schemas/Session.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  providers: [UpdateLastAiResponseService, SessionRepository],
  exports: [UpdateLastAiResponseService],
})
export class UpdateLastAiResponseModule {}
