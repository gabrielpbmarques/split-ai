import { Document } from 'langchain';

import { CustomDocument } from 'src/shared/contracts/models/custom-document.model';
import { SupabaseDocument } from 'src/shared/contracts/models/supabase-document.model';

export type Chunk =
  | Document<Record<string, unknown>>
  | SupabaseDocument
  | CustomDocument;
