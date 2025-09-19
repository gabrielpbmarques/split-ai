import { SupabaseMetadata } from '@langchain/community/vectorstores/supabase';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';

export interface SupabaseDocument {
  id: number;
  content: string;
  embedding: VertexAIEmbeddings;
  metadata: SupabaseMetadata;
  client_id: string;
}
