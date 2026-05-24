import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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
 * `id`, `organization_id`, and `email` set to `null`.
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

    // Resolve effective organization scope. JWT callers carry it on the user;
    // ApiKey callers must pass it via the DTO (organizationId or companyId).
    const organizationId = user.organization_id ?? dto.organizationId ?? null;
    const isServiceCaller = !user.organization_id;

    if (isServiceCaller && !dto.organizationId && !dto.companyId) {
      throw new BadRequestException(
        'organizationId ou companyId é obrigatório quando autenticado via ApiKey.',
      );
    }

    // Check credits only when we have a JWT-derived organization; API-key
    // service-to-service callers do not bill.
    if (user.organization_id) {
      const hasCredits = await this.consumeCreditsService.checkCredits(
        user.organization_id,
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

    // Propagate optional analytics scope so `LoadAnalyticsToolsService`
    // (which requires `companyId`) can wire its tool belt.
    const agent = await this.resolveAgentService.execute(agentId, {
      sessionId: session.id,
      companyId: dto.companyId,
      conversationId: dto.conversationId,
      threadId: dto.conversationId ?? session.id,
    });

    // Record user message
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

    // Accumulate `content` deltas as a fallback and capture the final text
    // when the structured response surfaces. Either path drives both the
    // chat-message persistence and credit consumption below.
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

      if (user.organization_id) {
        await this.consumeCreditsService.execute(
          user.organization_id,
          session.id,
          true,
        );
      }
    }
  }
}
