import { Injectable } from '@nestjs/common';
import { ExecuteSimilaritySearchService } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.service';
import { LoadDatabaseToolService } from 'src/components/ArtificialIntelligence/LoadDatabaseTool/load-database-tool.service';
import { LoadVectorStoreService } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.service';
import { NormalizePromptInstructionsService } from 'src/components/ArtificialIntelligence/NormalizePromptInstructions/normalize-prompt-instructions.service';
import {
  AIInstructions,
  AISourceType,
  CustomDocument,
  CustomMetadata,
} from 'src/types';

@Injectable()
export class BuildSystemPromptService {
  constructor(
    private normalizePromptInstructionsService: NormalizePromptInstructionsService,
    private loadVectorStoreService: LoadVectorStoreService,
    private executeSimilaritySearchService: ExecuteSimilaritySearchService,
    private loadDatabaseToolService: LoadDatabaseToolService,
  ) {}

  async execute(
    instructions: AIInstructions,
    metadata: CustomMetadata,
    question: string,
    sources?: AISourceType[],
  ): Promise<string> {
    const vectorStore = await this.loadVectorStoreService.execute({
      agent_id: metadata.agent_id,
    });

    const retrievedDocuments =
      await this.executeSimilaritySearchService.execute(vectorStore, question);

    const textPrompt =
      this.normalizePromptInstructionsService.execute(instructions);

    const databasePrompt = `
      Esquema autoritário (não invente colunas/tabelas):
      ${await this.loadDatabaseToolService.getSchema()}

      Regras:
      - Pense passo a passo.
      - Quando precisar de dados, chame a ferramenta 'execute_sql' com UMA consulta SELECT.
      - SOMENTE leitura, escrita e atualização, métodos SELECT, INSERT e UPDATE.
      - Se a ferramenta retornar 'Erro:', revise a consulta SQL e tente novamente.
      - Limite o número de tentativas a 5.
      - Se não for bem-sucedido após 5 tentativas, retorne uma nota para o usuário.
      - Prefira listas de colunas explícitas; evite SELECT *.
      - Para as colunas agent_id, organization_id e session_id, use os valores {agentId}, {organizationId} e {sessionId}, respectivamente.
    `;

    const source = retrievedDocuments
      .map((doc: CustomDocument) => doc.pageContent)
      .join(' ');

    if (!sources) {
      const final = `
        ${textPrompt}\n
        Banco de dados: ${databasePrompt}\n
        Data de hoje: ${new Date().toLocaleDateString()}\n
        Referência de conhecimento:\n${source}
      `;

      return final;
    }

    const groupedSources = retrievedDocuments.reduce(
      (acc, doc) => {
        const type = (doc.metadata?.source_type as AISourceType) || 'unknown';
        if (!acc[type]) acc[type] = [];
        acc[type].push(doc.pageContent as string);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    let sourceSection = '';
    for (const [type, content] of Object.entries(groupedSources)) {
      sourceSection += `\n${type.toUpperCase()}:\n- ${(content as string[]).join('\n- ')}\n`;
    }

    const final = `
      ${textPrompt}\n
      Banco de dados: ${databasePrompt}\n
      Data de hoje: ${new Date().toLocaleDateString()}\n
      Referência de conhecimento:\n${sourceSection}\n
    `;
    return final;
  }
}
