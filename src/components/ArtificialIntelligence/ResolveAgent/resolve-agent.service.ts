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

  private isUuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      id,
    );
  }

  async resolve(agentIdOrIdentifier: string): Promise<ResolvedAgent> {
    // 1) Tenta carregar do banco por UUID
    let dbAgent = null;
    if (this.isUuid(agentIdOrIdentifier)) {
      dbAgent = await this.agentRepository.findById(agentIdOrIdentifier);
    }

    // 2) Se não achou, tenta por agent_identifier
    if (!dbAgent) {
      dbAgent =
        await this.agentRepository.findByIdentifier(agentIdOrIdentifier);
    }

    // 3) Se achar no DB, monta o Agent compatível
    if (dbAgent) {
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
    throw new Error('Agent não encontrado');
  }
}
