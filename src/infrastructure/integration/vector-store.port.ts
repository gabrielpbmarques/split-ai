import { VectorStoreInterface } from '@langchain/core/vectorstores';

import { IntegrationGateway } from 'src/infrastructure/integration/integration.state';
import { Chunks, CustomMetadata } from 'src/shared/contracts';

export const VECTOR_STORE = Symbol('VECTOR_STORE');

export interface VectorStoreGateway extends IntegrationGateway {
  upsertChunks(chunks: Chunks, metadata: CustomMetadata): Promise<number>;
  loadIndex(filter: CustomMetadata): Promise<VectorStoreInterface>;
  deleteBySourceId(sourceId: string): Promise<void>;
}
