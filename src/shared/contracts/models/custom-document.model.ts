import { Document } from 'langchain';

export type CustomDocument =
  | Document<Record<string, unknown>>
  | Partial<Document<Record<string, unknown>>>;
