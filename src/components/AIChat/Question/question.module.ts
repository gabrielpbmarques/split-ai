import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { ArtificialIntelligenceModule } from 'src/components/ArtificialIntelligence/artificial-intelligence.module';
import { SessionModule } from 'src/components/Session/session.module';

@Module({
  imports: [
    InfrastructureModule,
    RepositoriesModule,
    ArtificialIntelligenceModule,
    SessionModule,
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
