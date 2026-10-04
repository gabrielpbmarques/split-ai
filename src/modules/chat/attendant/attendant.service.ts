import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { UserEntity } from 'src/infrastructure/database/schema';
import { GenerateAiResponseService } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.service';
import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import { QuestionDto } from 'src/modules/chat/question/question.dto';
import { RecordChatMessageService } from 'src/modules/chat/record-chat-message/record-chat-message.service';
import { CreateSessionIfNotExistsService } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.service';

@Injectable()
export class AttendantService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly recordChatMessageService: RecordChatMessageService,
  ) {}

  async execute(
    dto: QuestionDto,
    loggedUser: AuthenticatedUser,
  ): Promise<string> {
    const user: UserEntity = loggedUser as unknown as UserEntity;
    const { question, agentId } = dto;

    const promptVariables = {
      agentId,
      userName: user.name,
      userPhone: user.phone,
      userId: user.id,
    };

    const agent = await this.resolveAgentService.execute(
      agentId,
      promptVariables,
    );

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agent.id,
      user_id: user.id,
      organization_id: agent.organization_id,
    });

    // Record user message
    await this.recordChatMessageService.execute(
      session.id,
      user.id,
      agentId,
      question,
      'user',
    );

    const aiResponse = await this.generateAiResponseService.execute(
      question,
      {
        session_id: session.id,
        user_id: user.id,
        agent_id: agent.id,
      },
      agent,
      false,
    );

    // Record agent message
    if (aiResponse) {
      await this.recordChatMessageService.execute(
        session.id,
        user.id,
        agentId,
        typeof aiResponse === 'string'
          ? aiResponse
          : JSON.stringify(aiResponse),
        'agent',
      );
    }

    return aiResponse;
  }
}
