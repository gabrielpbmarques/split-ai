import { Injectable } from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema';
import { GenerateAiResponseService } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.service';
import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import { QuestionDto } from 'src/modules/chat/question/question.dto';
import { RecordChatMessageService } from 'src/modules/chat/record-chat-message/record-chat-message.service';
import { CreateSessionIfNotExistsService } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.service';
import { StreamEvent } from 'src/shared/contracts';

const STREAM = true;
type AuthenticatedUser = Pick<
  UserEntity,
  'id' | 'organization_id' | 'name' | 'phone' | 'email'
> & {
  role?: string;
  companyId?: number | string | null;
};

@Injectable()
export class QuestionService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly recordChatMessageService: RecordChatMessageService,
  ) {}

  async execute(
    dto: QuestionDto,
    user: AuthenticatedUser,
    onEvent: (event: StreamEvent) => void,
  ): Promise<void> {
    const { question, agentId } = dto;
    const organizationId = user.organization_id ?? null;

    const sessionOwnerKey = user.id;

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agentId,
      user_id: sessionOwnerKey,
      organization_id: organizationId ?? undefined,
    });

    const agent = await this.resolveAgentService.execute(agentId, {
      ...(dto.variables || {}),
      ...{},
      sessionId: session.id,
      conversationId: dto.conversationId,
      threadId: dto.conversationId ?? session.id,
    });

    await this.recordChatMessageService.execute(
      session.id,
      user.id ?? null,
      agent.id,
      question,
      'user',
    );

    const aiResponse = (await this.generateAiResponseService.execute(
      question,
      {
        session_id: session.id,
        conversation_id: dto.conversationId,
        user_id: user.id ?? undefined,
        agent_id: agent.id,
        organization_id: organizationId ?? undefined,
      },
      agent,
      STREAM,
    )) as AsyncIterable<StreamEvent>;

    let finalText: string | null = null;

    for await (const event of aiResponse) {
      onEvent(event);
      if (event.type === 'final') {
        finalText = event.text;
      }
    }

    const fullResponse = finalText;

    if (fullResponse) {
      await this.recordChatMessageService.execute(
        session.id,
        user.id ?? null,
        agent.id,
        fullResponse,
        'agent',
      );
    }
  }
}
