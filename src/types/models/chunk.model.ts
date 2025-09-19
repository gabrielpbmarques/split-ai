import { Document } from '@langchain/core/documents';

import { CustomDocument } from './custom-document.model';
import { SupabaseDocument } from './supabase-document.model';

export type Chunk =
  | Document<Record<string, unknown>>
  | SupabaseDocument
  | CustomDocument;
