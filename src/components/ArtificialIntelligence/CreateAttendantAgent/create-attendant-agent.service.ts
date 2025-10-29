import { Injectable } from '@nestjs/common';
import { AgentInstructionRepository, AgentRepository } from 'src/repositories';
import { User } from 'src/types';

import { CreateAttendantAgentDto } from './create-attendant-agent.dto';

@Injectable()
export class CreateAttendantAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
  ) {}

  async execute(dto: CreateAttendantAgentDto, user: User) {
    const {
      name: parser_name,
      description: parser_description,
      schema: parser_schema,
    } = this.getDefaultParser();

    const requestedOrgIdRaw =
      (dto as any).organization_id ?? dto.organizationId ?? null;
    const requestedOrgId =
      typeof requestedOrgIdRaw === 'string' &&
      requestedOrgIdRaw.trim().length === 0
        ? null
        : requestedOrgIdRaw;

    const orgIdToSave =
      user.role === 'admin' ? (requestedOrgId ?? null) : user.organization_id;

    const agent = await this.agentRepository.create({
      name: dto.name,
      agent_identifier: dto.agentIdentifier ?? null,
      model: dto.model ?? null,
      temperature: dto.temperature ?? 0.4,
      parser_name,
      parser_description,
      parser_schema,
      with_history: dto.withHistory ?? true,
      sites: dto.sites && dto.sites.length ? dto.sites : null,
      organization_id: orgIdToSave ?? null,
      user_id: user.id,
    });

    const defaultAttendantDirective = this.getDefaultAttendantDirective();

    const instructions = {
      ...dto.instructions,
      diretrizes: [defaultAttendantDirective, ...dto.instructions.diretrizes],
    };

    await this.agentInstructionRepository.create({
      agent_id: agent.id,
      instructions,
    });

    return { id: agent.id };
  }

  private getDefaultParser(): any {
    return {
      name: 'response-formatter',
      description: 'Estrutura de resposta para conversas',
      schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['appointment', 'order', 'faq'],
            description: 'Tipo da conversa',
            optional: true,
          },
          sentiment: {
            type: 'string',
            enum: ['positive', 'negative', 'neutral'],
            description: 'Sentimento da conversa',
            optional: true,
          },
          phone: {
            type: 'string',
            description: 'Telefone do cliente',
            optional: true,
          },
          name: {
            type: 'string',
            description: 'Nome do cliente',
            optional: true,
          },
          email: {
            type: 'string',
            description: 'Email do cliente',
            optional: true,
          },
          summary: {
            type: 'string',
            description: 'Resumo da conversa',
            optional: true,
          },
          insights: {
            type: 'string',
            description:
              'Dicas para um atendente humano sobre como abordar o cliente',
            optional: true,
          },
          return: {
            type: 'string',
            description: 'Retorno para o usuário',
            optional: true,
          },
          response: {
            type: 'string',
            description: 'Resposta para o usuário',
          },
          conversationFinished: {
            type: 'boolean',
            description: 'Indica se a conversa foi finalizada',
          },
        },
      },
    };
  }

  private getDefaultAttendantDirective(): string {
    return 'IMPORTANTE: Sempre use a tool response-formatter para estruturar sua resposta';
  }
}
