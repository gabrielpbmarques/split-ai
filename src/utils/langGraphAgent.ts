import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { MemorySaver } from '@langchain/langgraph';
import { createClient } from '@supabase/supabase-js';
import { BuildSystemPromptService } from 'src/components/ArtificialIntelligence/BuildSystemPrompt/build-system-prompt.service';
import { ExecuteSimilaritySearchService } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.service';
import { LoadCheckpointerService } from 'src/components/ArtificialIntelligence/LoadCheckpointer/load-checkpointer.service';
import { LoadDatabaseToolService } from 'src/components/ArtificialIntelligence/LoadDatabaseTool/load-database-tool.service';
import { LoadVectorSearchToolService } from 'src/components/ArtificialIntelligence/LoadVectorSearchTool/load-vector-search-tool.service';
import { LoadVectorStoreService } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.service';
import { NormalizePromptInstructionsService } from 'src/components/ArtificialIntelligence/NormalizePromptInstructions/normalize-prompt-instructions.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { config } from 'src/config';
import {
  UserEntity,
  OrganizationEntity,
  UserTokenEntity,
  SmsVerificationEntity,
  NotificationEntity,
  SessionEntity,
  MessageEntity,
  AgentEntity,
  AgentInstructionEntity,
  ReportEntity,
  TokenUsageEntity,
  SourceEntity,
  CreditTransactionEntity,
  CreditBalanceEntity,
  PlanEntity,
  SubscriptionEntity,
  PaymentEntity,
} from 'src/entities';
import { AgentRepository, AgentInstructionRepository } from 'src/repositories';
import { DataSource } from 'typeorm';

export const graph = async () => {
  const appDataSource = new DataSource({
    type: 'postgres',
    host: config.databaseHost,
    port: parseInt(config.databasePort || '5432', 10),
    username: config.databaseUserName,
    password: config.databasePassword,
    database: config.databaseName,
    poolSize: 20,
    entities: [
      AgentEntity,
      AgentInstructionEntity,
      OrganizationEntity,
      UserEntity,
      UserTokenEntity,
      SmsVerificationEntity,
      NotificationEntity,
      SessionEntity,
      MessageEntity,
      ReportEntity,
      TokenUsageEntity,
      SourceEntity,
      CreditTransactionEntity,
      CreditBalanceEntity,
      PlanEntity,
      SubscriptionEntity,
      PaymentEntity,
    ],
    synchronize: false,
  });

  await appDataSource.initialize();

  const memoryCheckpointer = new MemorySaver();

  const resolveAgentService = new ResolveAgentService(
    new AgentRepository(appDataSource.getRepository(AgentEntity)),
    new AgentInstructionRepository(
      appDataSource.getRepository(AgentInstructionEntity),
    ),
    new LoadVectorSearchToolService(
      new LoadVectorStoreService(
        new VertexAIEmbeddings({
          model: config.embeddingModel,
        }),
        createClient(config.supabaseUrl, config.supabaseKey as string),
      ),
      new ExecuteSimilaritySearchService(
        new VertexAIEmbeddings({
          model: config.embeddingModel,
        }),
      ),
    ),
    new BuildSystemPromptService(new NormalizePromptInstructionsService()),
    new LoadDatabaseToolService(),
    new LoadCheckpointerService(),
  );
  const agent = await resolveAgentService.execute(
    process.env.AGENT_ID,
    {
      agentId: process.env.AGENT_ID,
      userName: process.env.USER_NAME,
      userPhone: process.env.USER_PHONE,
      userId: process.env.USER_ID,
    },
    memoryCheckpointer,
  );

  return agent.runnable;
};
