import { createHash } from 'crypto';

import { Embeddings } from '@langchain/core/embeddings';

const DIMENSIONS = 16;

export class MockEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map((document) => this.vectorFor(document));
  }

  async embedQuery(document: string): Promise<number[]> {
    return this.vectorFor(document);
  }

  private vectorFor(text: string): number[] {
    const digest = createHash('sha256').update(text).digest();
    const vector = Array.from(
      { length: DIMENSIONS },
      (_, i) => digest[i] / 255,
    );
    const norm = Math.hypot(...vector) || 1;

    return vector.map((value) => value / norm);
  }
}
