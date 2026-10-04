import { Embeddings } from '@langchain/core/embeddings';

export const EMBEDDINGS = Symbol('EMBEDDINGS');

export type EmbeddingsGateway = Embeddings;
