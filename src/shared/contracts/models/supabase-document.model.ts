export interface SupabaseDocument {
  id: number;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  client_id: string;
}
