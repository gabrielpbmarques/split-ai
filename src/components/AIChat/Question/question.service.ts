import { ForbiddenException, Injectable } from '@nestjs/common';
import { RecordChatMessageService } from 'src/components/AIChat/RecordChatMessage/record-chat-message.service';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { ConsumeCreditsService } from 'src/components/Credits/ConsumeCredits/consume-credits.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { UserEntity } from 'src/entities';
import { StreamEvent } from 'src/types';

import { QuestionDto } from './question.dto';

const STREAM = true;

/**
 * The auth-derived user. For JWT callers this is a real `UserEntity` shape;
 * for API-key (server-to-server) callers it is a synthetic service user with
 * `id` and `email` set to `null` and `organization_id` resolved from the
 * `chat_embed_token` by `ApiKeyGuard`.
 */
type AuthenticatedUser = Pick<
  UserEntity,
  'id' | 'organization_id' | 'name' | 'phone' | 'email'
> & {
  role?: string;
};

@Injectable()
export class QuestionService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly recordChatMessageService: RecordChatMessageService,
    private readonly consumeCreditsService: ConsumeCreditsService,
  ) {}

  async execute(
    dto: QuestionDto,
    user: AuthenticatedUser,
    onEvent: (event: StreamEvent) => void,
  ): Promise<void> {
    const { question, agentId } = dto;
    const organizationId = user.organization_id ?? null;
    const billable = !!user.organization_id && user.role !== 'service';

    if (billable) {
      const hasCredits = await this.consumeCreditsService.checkCredits(
        user.organization_id as string,
      );
      if (!hasCredits) {
        throw new ForbiddenException(
          'Créditos insuficientes. Por favor, adquira mais créditos para continuar.',
        );
      }
    }

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agentId,
      user_id: user.id ?? undefined,
      organization_id: organizationId ?? undefined,
    });

    const agent = await this.resolveAgentService.execute(agentId, {
      ...(dto.variables || {}),
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
        user_id: user.id ?? undefined,
        agent_id: agent.id,
        organization_id: organizationId ?? undefined,
      },
      agent,
      STREAM,
    )) as AsyncIterable<StreamEvent>;

    let contentBuffer = '';
    let finalText: string | null = null;

    for await (const event of aiResponse) {
      onEvent(event);
      if (event.type === 'content') {
        contentBuffer += event.delta;
      } else if (event.type === 'final') {
        finalText = event.text;
      }
    }

    const fullResponse = finalText ?? contentBuffer;

    if (fullResponse) {
      await this.recordChatMessageService.execute(
        session.id,
        user.id ?? null,
        agent.id,
        fullResponse,
        'agent',
      );

      if (billable) {
        await this.consumeCreditsService.execute(
          user.organization_id as string,
          session.id,
          true,
        );
      }
    }
  }
}
