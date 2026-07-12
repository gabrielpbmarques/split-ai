import { ForbiddenException, Injectable } from '@nestjs/common';
import { RecordChatMessageService } from 'src/components/AIChat/RecordChatMessage/record-chat-message.service';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { ConsumeCreditsService } from 'src/components/Credits/ConsumeCredits/consume-credits.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { config } from 'src/config';
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
  /**
   * Trusted BravoHub tenant scope, populated ONLY by the JWT bridge from a
   * verified platform token (never from the request body). Absent for native
   * split-ai / API-key callers.
   */
  companyId?: number | string | null;
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

    // Trusted, server-derived tenant scope (from the verified JWT). The client
    // can NEVER influence which company's data is read.
    const scopedCompanyId =
      user.companyId !== undefined &&
      user.companyId !== null &&
      `${user.companyId}` !== ''
        ? String(user.companyId)
        : undefined;

    // Fail closed: agents that read the shared multi-tenant BravoHub database
    // must only ever run under a verified company scope. A caller without one
    // (native JWT, API key, or a leaked embed token) can never reach that data.
    if (config.bravohubScopedAgents.includes(agentId) && !scopedCompanyId) {
      throw new ForbiddenException(
        'Escopo de empresa ausente: este agente exige um token autenticado da empresa.',
      );
    }

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

    // Server-controlled keys override anything the client passed. `companyId`
    // is forced from the verified token so client `variables` cannot widen scope.
    const agent = await this.resolveAgentService.execute(agentId, {
      ...(dto.variables || {}),
      ...(scopedCompanyId ? { companyId: scopedCompanyId } : {}),
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
