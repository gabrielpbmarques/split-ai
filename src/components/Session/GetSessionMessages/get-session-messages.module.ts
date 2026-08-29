import { Module } from '@nestjs/common';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';
import { CreditTransactionRepositoryModule } from 'src/repositories/credit-transaction.repository.module';
import { MessageRepositoryModule } from 'src/repositories/message.repository.module';
import { SessionRepositoryModule } from 'src/repositories/session.repository.module';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { GetSessionMessagesController } from './get-session-messages.controller';
import { GetSessionMessagesService } from './get-session-messages.service';

@Module({
  imports: [
    AgentRepositoryModule,
    CreditTransactionRepositoryModule,
    MessageRepositoryModule,
    SessionRepositoryModule,
    UserRepositoryModule,
  ],
  controllers: [GetSessionMessagesController],
  providers: [GetSessionMessagesService],
  exports: [GetSessionMessagesService],
})
export class GetSessionMessagesModule {}
