import { Injectable } from '@nestjs/common';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { AgentRepository } from 'src/supabase-repositories/agent.repository';
import { AgentInstructionRepository } from 'src/supabase-repositories/agent-instruction.repository';
import { config } from 'src/config';
import { buildLangchainToolFromSchema } from 'src/utils/buildZodSchema';
import { ResolvedAgent } from 'src/types/ResolvedAgent';

@Injectable()
export class ResolveAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
  ) {}

  async resolve(agentId: string): Promise<ResolvedAgent> {
    const dbAgent = await this.agentRepository.findOne({
      where: {
        id: agentId,
      },
    });

    if (!dbAgent) {
      throw new Error('Agent não encontrado');
    }

    const latestInstructions =
      await this.agentInstructionRepository.findLatestByAgentId(dbAgent.id);

    const chat = new ChatVertexAI({
      model: dbAgent.model || config.aiModel,
      temperature: dbAgent.temperature ?? 0.4,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
    });

    const runnableOpts = { withHistory: !!dbAgent.with_history };

    const jsonParser = dbAgent.parser_schema
      ? buildLangchainToolFromSchema(
          dbAgent.parser_name || 'dynamicParser',
          dbAgent.parser_description || 'Ferramenta de parsing dinâmica',
          dbAgent.parser_schema,
        )
      : undefined;

    return {
      instructions: latestInstructions?.instructions || {
        context: '',
        diretrizes: {},
        objetivo: '',
      },
      chat,
      jsonParser,
      runnableOpts,
    } as ResolvedAgent;
  }
}
