import { Injectable } from '@nestjs/common';
import {
  AgentMiddleware,
  createAgent,
  ReactAgent,
  ResponseFormatUndefined,
} from 'langchain';
import { LoadCheckpointerService } from 'src/components/ArtificialIntelligence/LoadCheckpointer/load-checkpointer.service';
import { ResolvedAgent } from 'src/types';

@Injectable()
export class LoadAiChatService {
  constructor(
    private readonly loadCheckpointerService: LoadCheckpointerService,
  ) {}

  async execute(
    agent: ResolvedAgent,
  ): Promise<
    ReactAgent<
      ResponseFormatUndefined,
      undefined,
      any,
      readonly AgentMiddleware<any, any, any>[]
    >
  > {
    const { chat, systemPrompt, runnableOpts, tools } = agent;

    if (runnableOpts.withHistory) {
      const checkpointer = this.loadCheckpointerService.execute();

      return createAgent({
        model: chat as any,
        tools,
        systemPrompt,
        checkpointer,
      });
    }

    return createAgent({
      model: chat as any,
      tools,
      systemPrompt,
    });
  }
}
