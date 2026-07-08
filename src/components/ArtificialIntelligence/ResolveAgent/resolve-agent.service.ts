import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import {
  DynamicStructuredTool,
  createAgent,
  createMiddleware,
} from 'langchain';
import { LoadDatabaseToolService } from 'src/components/Tools/LoadDatabaseTool/load-database-tool.service';
import { LoadVectorSearchToolService } from 'src/components/Tools/LoadVectorSearchTool/load-vector-search-tool.service';
import { config } from 'src/config';
import { AgentEntity } from 'src/entities';
import {
  AgentRepository,
  AgentInstructionRepository,
  AgentConnectionRepository,
  OrganizationRepository,
  OrganizationFeatureRepository,
} from 'src/repositories';
import { AgentFinalResponseSchema, ResolvedAgent } from 'src/types';
import { buildLangchainToolFromSchema } from 'src/utils/buildZodSchema';
import { sanitizeToolCallMessages } from 'src/utils/sanitizeToolCallMessages';
import { z } from 'zod';

import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';
import { LoadCheckpointerService } from '../LoadCheckpointer/load-checkpointer.service';

const DATABASE_CONNECTION_FEATURE_KEY = 'database_connection';

// Repairs the checkpointed history before every model call so a partially
// persisted turn (a run that died after the `tool_use` was saved but before its
// `tool_result`) can never poison the thread. Without this, Anthropic rejects
// the whole request with `tool_use` ids without `tool_result` blocks, and the
// error repeats on every subsequent turn of the same session. Stateless — the
// transform only affects what is sent to the model, not the stored checkpoint.
const sanitizeHistoryMiddleware = createMiddleware({
  name: 'sanitize-tool-call-history',
  wrapModelCall: (request, handler) =>
    handler({
      ...request,
      messages: sanitizeToolCallMessages(request.messages),
    }),
});

// How deep agent-as-tool delegation may go. At depth 1 a principal may call its
// directly-connected children, but those children do NOT expand their own
// connections — a hard, deterministic bound on recursion regardless of any
// cycle in the connection graph.
const MAX_AGENT_CONNECTION_DEPTH = 1;

// Claude models that reject the `temperature` (and top_p/top_k) sampling params
// with a 400 — the adaptive-thinking-only families. `@langchain/anthropic` sends
// `temperature` whenever it is defined and (as of 1.4.0) only guards against
// `claude-opus-4-7`, so we must omit it ourselves for these models or the very
// first LLM call fails. Prefix match; extend as new such models ship.
const MODELS_WITHOUT_SAMPLING_PARAMS = [
  'claude-opus-4-7',
  'claude-opus-4-8',
  'claude-sonnet-5',
  'claude-fable-5',
  'claude-mythos-5',
];

@Injectable()
export class ResolveAgentService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly agentInstructionRepository: AgentInstructionRepository,
    private readonly agentConnectionRepository: AgentConnectionRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationFeatureRepository: OrganizationFeatureRepository,
    private readonly loadVectorSearchToolService: LoadVectorSearchToolService,
    private readonly buildSystemPromptService: BuildSystemPromptService,
    private readonly loadDatabaseToolService: LoadDatabaseToolService,
    private readonly loadCheckpointerService: LoadCheckpointerService,
  ) {}

  async execute(
    agentId: string,
    promptVariables?: any,
    memorySaver?: MemorySaver,
    connectionContext?: { depth: number; visited: string[] },
  ): Promise<ResolvedAgent> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        agentId,
      );
    const agent = await this.agentRepository.findOne({
      where: isUuid ? { id: agentId } : { agent_identifier: agentId },
    });

    if (!agent) {
      throw new Error('Agent não encontrado');
    }

    const latestInstructions =
      await this.agentInstructionRepository.findLatestByAgentId(agent.id);

    const runnableOpts = { withHistory: !!agent.with_history };

    const [chat, tools] = await Promise.all([
      this.loadChat(agent),
      this.loadTools(agent, connectionContext),
    ]);

    const systemPrompt = await this.buildSystemPromptService.execute(
      latestInstructions?.instructions,
      tools,
      {
        ...promptVariables,
        organizationId: agent.organization_id,
      },
    );

    let checkpointer;

    if (runnableOpts.withHistory) {
      if (memorySaver) {
        checkpointer = memorySaver;
      } else {
        checkpointer = this.loadCheckpointerService.execute();
      }
    }

    const runnable = createAgent({
      model: chat as any,
      tools,
      systemPrompt,
      checkpointer,
      middleware: [sanitizeHistoryMiddleware],
      responseFormat: AgentFinalResponseSchema,
    });

    return {
      id: agent.id,
      systemPrompt,
      chat,
      tools,
      runnableOpts,
      sites: (agent as any).sites || undefined,
      organization_id: agent.organization_id,
      runnable,
    };
  }

  private async loadChat(agent: AgentEntity): Promise<ChatAnthropic> {
    const model = agent.model || config.aiModel;

    // Only send `temperature` to models that still accept it. For the
    // adaptive-thinking-only families it must be omitted (passing `undefined`
    // makes @langchain/anthropic drop it) — otherwise the API returns
    // `400 temperature is deprecated for this model` and the whole run fails.
    const acceptsSamplingParams = !MODELS_WITHOUT_SAMPLING_PARAMS.some(
      (prefix) => model.startsWith(prefix),
    );

    return new ChatAnthropic({
      model,
      temperature: acceptsSamplingParams
        ? (agent.temperature ?? 0.4)
        : undefined,
    });
  }

  private async loadTools(
    dbAgent: AgentEntity,
    connectionContext?: { depth: number; visited: string[] },
  ): Promise<DynamicStructuredTool<z.ZodObject<any>>[]> {
    const tools: DynamicStructuredTool<z.ZodObject<any>>[] = [];

    if (dbAgent.parser_schema) {
      tools.push(
        buildLangchainToolFromSchema(
          dbAgent.parser_name || 'dynamic_parser',
          dbAgent.parser_description || 'Ferramenta de parsing dinâmica',
          dbAgent.parser_schema,
        ),
      );
    }

    if (dbAgent.vector_search_tool) {
      tools.push(await this.loadVectorSearchToolService.execute());
    }

    if (dbAgent.database_tool && dbAgent.organization_id) {
      const databaseTool = await this.maybeLoadDatabaseTool(
        dbAgent.organization_id,
      );
      if (databaseTool) {
        tools.push(databaseTool);
      }
    }

    await this.appendConnectionTools(dbAgent, tools, connectionContext);

    return tools;
  }

  /**
   * Turns each enabled connection of `dbAgent` into a tool that delegates to the
   * connected child agent. Bounded by `MAX_AGENT_CONNECTION_DEPTH` and a
   * visited-set so the connection graph can never recurse without end.
   */
  private async appendConnectionTools(
    dbAgent: AgentEntity,
    tools: DynamicStructuredTool<z.ZodObject<any>>[],
    connectionContext?: { depth: number; visited: string[] },
  ): Promise<void> {
    const depth = connectionContext?.depth ?? 0;
    const visited = connectionContext?.visited ?? [dbAgent.id];

    if (depth >= MAX_AGENT_CONNECTION_DEPTH) {
      return;
    }

    const connections =
      await this.agentConnectionRepository.findEnabledByPrincipalAgentId(
        dbAgent.id,
      );

    for (const connection of connections) {
      tools.push(
        new DynamicStructuredTool({
          name: connection.tool_name,
          description: connection.tool_description,
          schema: z.object({
            input: z
              .string()
              .describe('Pergunta ou tarefa a delegar ao agente conectado.'),
          }),
          func: async ({ input }) => {
            if (visited.includes(connection.child_agent_id)) {
              return 'Conexão circular detectada; chamada ignorada.';
            }
            return this.invokeConnectedAgent(connection.child_agent_id, input, {
              depth: depth + 1,
              visited: [...visited, connection.child_agent_id],
            });
          },
        }),
      );
    }
  }

  /**
   * Resolves and runs a connected child agent for a single delegated call. The
   * child is given an ephemeral in-memory checkpointer so its history never
   * collides with the parent conversation nor touches the shared Postgres
   * saver — each delegated call is answered fresh. Failures degrade to a
   * pt-BR fallback so a broken child never breaks the principal's run.
   *
   * NOTE: child token usage is not separately metered in this v1; the principal
   * conversation is still billed once at the QuestionService level.
   */
  private async invokeConnectedAgent(
    childAgentId: string,
    input: string,
    connectionContext: { depth: number; visited: string[] },
  ): Promise<string> {
    try {
      const childAgent = await this.execute(
        childAgentId,
        undefined,
        new MemorySaver(),
        connectionContext,
      );

      const result = await childAgent.runnable.invoke(
        { messages: [new HumanMessage(input)] } as any,
        {
          configurable: { thread_id: `conn_${childAgent.id}` },
          tags: [config.env, childAgent.id, childAgent.organization_id],
        },
      );

      const parsed = AgentFinalResponseSchema.safeParse(
        (result as any)?.structuredResponse,
      );
      if (parsed.success) {
        return parsed.data.finalAnswer;
      }

      return (
        (result as any)?.structuredResponse?.finalAnswer ??
        'O agente conectado não retornou uma resposta.'
      );
    } catch {
      return 'O agente conectado não está disponível no momento.';
    }
  }

  private async maybeLoadDatabaseTool(
    organizationId: string,
  ): Promise<DynamicStructuredTool<z.ZodObject<any>> | null> {
    const feature = await this.organizationFeatureRepository.getEnabledFeature(
      organizationId,
      DATABASE_CONNECTION_FEATURE_KEY,
    );
    if (!feature) {
      return null;
    }

    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization?.database_url) {
      return null;
    }

    // Optional per-org scoping stored on the feature row's `config`:
    //   { "tables": ["app_company_campaign", ...], "sampleRows": 0 }
    // Without it the tool introspects every table (backwards compatible); on a
    // large schema that bloats the system prompt, so prefer an allow-list.
    const config = (feature.config ?? {}) as {
      tables?: string[];
      sampleRows?: number;
    };

    return this.loadDatabaseToolService.execute({
      databaseUrl: organization.database_url,
      includeTables: config.tables?.length ? config.tables : undefined,
      sampleRows:
        typeof config.sampleRows === 'number' ? config.sampleRows : undefined,
    });
  }
}
