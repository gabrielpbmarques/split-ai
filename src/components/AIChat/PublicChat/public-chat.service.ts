import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { OrganizationRepository, SessionRepository } from 'src/repositories';

import {
  PublicChatMessageDto,
  PublicCreateSessionDto,
} from './public-chat.dto';

@Injectable()
export class PublicChatService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly sessionRepository: SessionRepository,
    private readonly generateAiResponseService: GenerateAiResponseService,
  ) {}

  private async validateOrgAndToken(orgId: string, token: string) {
    const org = await this.organizationRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organização não encontrada');
    if (!org.chat_embed_enabled)
      throw new BadRequestException('Widget desabilitado');
    if (!org.chat_embed_token || org.chat_embed_token !== token) {
      throw new BadRequestException('Token inválido');
    }
    return org;
  }

  async createSession(dto: PublicCreateSessionDto) {
    const org = await this.validateOrgAndToken(dto.org, dto.token);
    const agentId = dto.agentId || org.chat_embed_agent_id;
    if (!agentId) throw new BadRequestException('Agente não configurado');

    const agent = await this.resolveAgentService.resolve(agentId);
    const session = await this.createSessionIfNotExistsService.execute(
      { agent_id: agent.id },
      true,
    );

    return { session_id: session.id };
  }

  async sendMessage(dto: PublicChatMessageDto) {
    const org = await this.validateOrgAndToken(dto.org, dto.token);
    const agentId = dto.agentId || org.chat_embed_agent_id;
    if (!agentId) throw new BadRequestException('Agente não configurado');

    const session = await this.sessionRepository.findById(dto.session_id);
    if (!session) throw new NotFoundException('Sessão não encontrada');

    const agent = await this.resolveAgentService.resolve(agentId);

    const result = await this.generateAiResponseService.execute(
      dto.question,
      { session_id: session.id, agent_id: agent.id },
      agent,
      false,
    );

    if (typeof result === 'string') {
      return { response: result };
    }

    // If tool-call/JSON response, return as-is
    return { response: result };
  }
}
