import type { Document } from 'langchain';

import type { CustomDocument } from 'src/shared/contracts/models/custom-document.model';
import type { SupabaseDocument } from 'src/shared/contracts/models/supabase-document.model';

export type Chunks =
  | Document<Record<string, unknown>>[]
  | SupabaseDocument[]
  | CustomDocument[];
