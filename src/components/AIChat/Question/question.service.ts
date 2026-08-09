import { ForbiddenException, Injectable } from '@nestjs/common';
import { RecordChatMessageService } from 'src/components/AIChat/RecordChatMessage/record-chat-message.service';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { config } from 'src/config';
import { UserEntity } from 'src/entities';
import { StreamEvent } from 'src/types';

import { QuestionDto } from './question.dto';

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

    const scopedCompanyId =
      user.companyId !== undefined &&
      user.companyId !== null &&
      `${user.companyId}` !== ''
        ? String(user.companyId)
        : undefined;

    if (config.bravohubScopedAgents.includes(agentId) && !scopedCompanyId) {
      throw new ForbiddenException(
        'Escopo de empresa ausente: este agente exige um token autenticado da empresa.',
      );
    }

    const sessionOwnerKey =
      user.id ?? (scopedCompanyId ? `company:${scopedCompanyId}` : undefined);

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agentId,
      user_id: sessionOwnerKey,
      organization_id: organizationId ?? undefined,
    });

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
