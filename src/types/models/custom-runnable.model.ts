import { AIMessageChunk } from '@langchain/core/messages';
import {
  Runnable,
  RunnableConfig,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';

export type CustomRunnable =
  | Runnable<any, AIMessageChunk, RunnableConfig<Record<string, any>>>
  | RunnableWithMessageHistory<any, AIMessageChunk>;
