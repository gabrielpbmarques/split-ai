import { Module } from '@nestjs/common';
import { SaveSessionService } from './save-session.service';
import { SessionRepository } from 'src/repositories/Session.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from 'src/schemas/Session.schema';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  providers: [SaveSessionService, SessionRepository],
  exports: [SaveSessionService],
})
export class SaveSessionModule {}
