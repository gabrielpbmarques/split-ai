import { InferContextInput, InferMiddlewareContextInputs } from 'langchain';

export type InvokeConfigurationModel = InferContextInput<any> &
  InferMiddlewareContextInputs<any>;
