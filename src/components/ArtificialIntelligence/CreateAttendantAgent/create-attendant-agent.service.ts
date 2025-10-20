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
      organization_id: user.role === 'admin' ? null : user.organization_id,
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
      name: 'attendantParserFormatter',
      description:
        'Estrutura de relatório para atendente com resumo, sentimento e status da conversa',
      schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['appointment', 'order', 'faq'],
            optional: true,
          },
          sentiment: {
            type: 'string',
            enum: ['positive', 'negative', 'neutral'],
            optional: true,
          },
          summary: {
            type: 'string',
          },
          insights: {
            type: 'string',
            optional: true,
          },
          return: {
            type: 'string',
            optional: true,
          },
          response: {
            type: 'string',
          },
          conversationFinished: {
            type: 'boolean',
          },
        },
      },
    };
  }

  private getDefaultAttendantDirective(): string {
    return `
        IMPORTANTE: Todas as respostas devem estar no formato JSON, com os campos:

        type: tipo da conversa (appointment, order, faq)
        sentiment: sentimento da conversa (positive, negative, neutral)
        summary: resumo da conversa
        insights: se fizer sentido, dicas para um atendente humano sobre como abordar o cliente
        conversationFinished: true se você interpretar que a conversa foi finalizada, false caso contrário
        response: todas as suas respostas ao usuário serão definidas neste campo
    `;
  }
}
