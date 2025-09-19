import { DocumentInterface } from '@langchain/core/documents';

export type CustomDocument =
  | DocumentInterface<Record<string, unknown>>
  | Partial<DocumentInterface<Record<string, unknown>>>;
