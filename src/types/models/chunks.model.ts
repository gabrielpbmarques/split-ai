import { Document } from 'langchain';

import { CustomDocument } from './custom-document.model';
import { SupabaseDocument } from './supabase-document.model';

export type Chunks =
  | Document<Record<string, unknown>>[]
  | SupabaseDocument[]
  | CustomDocument[];
