import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GenerateAiResponseService } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.service';
import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import type { QuestionDto } from 'src/modules/chat/question/question.dto';
import { RecordChatMessageService } from 'src/modules/chat/record-chat-message/record-chat-message.service';
import { CreateSessionIfNotExistsService } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.service';
import type { StreamEvent } from 'src/shared/contracts';

const STREAM = true;

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
    param: { agentId: string },
    user: AuthenticatedUser,
    onEvent: (event: StreamEvent) => void,
  ): Promise<void> {
    const { question } = dto;
    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: param.agentId,
      user_id: user.id,
      session_id: dto.threadId,
    });

    const agent = await this.resolveAgentService.execute(param.agentId);

    await this.recordChatMessageService.execute(
      session.id,
      user.id,
      agent.id,
      question,
      'user',
    );

    const aiResponse = (await this.generateAiResponseService.execute(
      question,
      {
        session_id: session.id,
        conversation_id: dto.threadId,
        user_id: user.id,
        agent_id: agent.id,
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
        user.id,
        agent.id,
        fullResponse,
        'agent',
      );
    }
  }
}
