import { Module } from '@nestjs/common';
import { FindOrCreateSessionService } from './find-or-create-session.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../../../schemas/Session.schema';
import { SessionRepository } from '../../../repositories/Session.repository';
import { DatabaseModule } from '../../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  providers: [FindOrCreateSessionService, SessionRepository],
  exports: [FindOrCreateSessionService],
})
export class FindOrCreateSessionModule {}
