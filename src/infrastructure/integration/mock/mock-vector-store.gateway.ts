import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { Embeddings } from '@langchain/core/embeddings';
import { VectorStoreInterface } from '@langchain/core/vectorstores';
import { Document } from 'langchain';

import { IntegrationState } from 'src/infrastructure/integration/integration.state';
import { VectorStoreGateway } from 'src/infrastructure/integration/vector-store.port';
import { Chunks, CustomMetadata } from 'src/shared/contracts';

type StoredDocument = Document<Record<string, unknown>>;

export class MockVectorStoreGateway implements VectorStoreGateway {
  readonly name = 'supabase';

  private readonly documents: StoredDocument[] = [];

  constructor(private readonly embeddings: Embeddings) {}

  state(): IntegrationState {
    return 'MOCK';
  }

  async upsertChunks(
    chunks: Chunks,
    metadata: CustomMetadata,
  ): Promise<number> {
    const documents = (chunks as ReadonlyArray<Chunks[number]>).map(
      (chunk) =>
        new Document({
          pageContent:
            (chunk as { pageContent?: string }).pageContent ||
            (chunk as { content?: string }).content ||
            '',
          metadata: { ...(chunk.metadata ?? {}), ...metadata },
        }),
    );

    this.documents.push(...documents);

    return documents.length;
  }

  async loadIndex(filter: CustomMetadata): Promise<VectorStoreInterface> {
    const matching = this.documents.filter((document) =>
      Object.entries(filter).every(
        ([key, value]) =>
          value === undefined || document.metadata[key] === value,
      ),
    );

    return MemoryVectorStore.fromDocuments(matching, this.embeddings);
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    for (let i = this.documents.length - 1; i >= 0; i -= 1) {
      if (this.documents[i].metadata.source_id === sourceId) {
        this.documents.splice(i, 1);
      }
    }
  }
}
