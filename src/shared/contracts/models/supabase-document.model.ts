import { SupabaseMetadata } from '@langchain/community/vectorstores/supabase';

export interface SupabaseDocument {
  id: number;
  content: string;
  embedding: number[];
  metadata: SupabaseMetadata;
  client_id: string;
}
