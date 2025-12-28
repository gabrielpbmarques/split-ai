import { InferContextInput, InferMiddlewareContextInputs } from 'langchain';
import { InvokeConfiguration } from 'node_modules/langchain/dist/agents/runtime.cjs';

export type InvokeConfigurationModel = InvokeConfiguration<
  InferContextInput<any> & InferMiddlewareContextInputs<any>
>;
