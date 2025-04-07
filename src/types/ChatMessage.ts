import { InputValues } from '@langchain/core/dist/utils/types';
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
} from '@langchain/core/prompts';

export type ChatMessage =
  | ChatPromptTemplate<InputValues, string>
  | BaseMessagePromptTemplateLike;
