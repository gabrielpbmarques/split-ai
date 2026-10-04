import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { CreditTransactionRepositoryModule } from 'src/modules/billing/repositories/credit-transaction.repository.module';
import { GetSessionMessagesController } from 'src/modules/sessions/get-session-messages/get-session-messages.controller';
import { GetSessionMessagesService } from 'src/modules/sessions/get-session-messages/get-session-messages.service';
import { MessageRepositoryModule } from 'src/modules/sessions/repositories/message.repository.module';
import { SessionRepositoryModule } from 'src/modules/sessions/repositories/session.repository.module';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [
    AuthModule,
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
