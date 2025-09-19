import { AIMessageChunk } from '@langchain/core/messages';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';

export type RunnableChat = {
  runnable: Runnable<any, AIMessageChunk, RunnableConfig<Record<string, any>>>;
  config: RunnableConfig;
};
