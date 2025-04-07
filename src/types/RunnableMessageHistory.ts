import { AIMessageChunk } from '@langchain/core/messages';
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';

export type RunnableMessageHistory = {
  runnable: RunnableWithMessageHistory<unknown, AIMessageChunk>;
  config: RunnableConfig;
};
