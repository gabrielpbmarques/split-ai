import { Document } from '@langchain/core/documents';
import { CustomDocument } from './CustomDocument';
import { SupabaseDocument } from './SupabaseDocument';

export type Chunks =
  | Document<Record<string, unknown>>[]
  | SupabaseDocument[]
  | CustomDocument[];
