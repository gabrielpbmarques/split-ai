import { Document } from '@langchain/core/documents';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RERANKER } from 'src/infrastructure/integration/reranker.port';
import { RerankDocumentsService } from 'src/modules/retrieval/rerank-documents/rerank-documents.service';
import { env } from 'src/shared/config/env';

jest.mock('src/shared/config/env', () => ({
  env: { VECTOR_SEARCH_MIN_SCORE: 0.8, VECTOR_SEARCH_MAX_RESULTS: 10 },
}));

describe('RerankDocumentsService', () => {
  let service: RerankDocumentsService;

  const mockRerankService = {
    rerank: jest.fn(),
  };

  const buildDocuments = (count: number): Document[] =>
    Array.from(
      { length: count },
      (_, index) =>
        new Document({
          pageContent: `chunk ${index}`,
          metadata: { agent_id: 'agent-1', chunk_index: index },
        }),
    );

  beforeEach(async () => {
    jest.clearAllMocks();

    env.VECTOR_SEARCH_MIN_SCORE = 0.8;
    env.VECTOR_SEARCH_MAX_RESULTS = 10;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RerankDocumentsService,
        { provide: RERANKER, useValue: mockRerankService },
      ],
    }).compile();

    service = module.get<RerankDocumentsService>(RerankDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('keeps only documents scored at or above the threshold', async () => {
    const documents = buildDocuments(3);

    mockRerankService.rerank.mockResolvedValue([
      { index: 2, relevanceScore: 0.91 },
      { index: 0, relevanceScore: 0.8 },
      { index: 1, relevanceScore: 0.79 },
    ]);

    const result = await service.execute().compressDocuments(documents, 'q');

    expect(result.map((document) => document.pageContent)).toEqual([
      'chunk 2',
      'chunk 0',
    ]);
  });

  it('maps each score back to the document the reranker pointed at', async () => {
    const documents = buildDocuments(3);

    mockRerankService.rerank.mockResolvedValue([
      { index: 2, relevanceScore: 0.95 },
      { index: 0, relevanceScore: 0.85 },
    ]);

    const result = await service.execute().compressDocuments(documents, 'q');

    expect(result[0].metadata).toEqual({
      agent_id: 'agent-1',
      chunk_index: 2,
      relevance_score: 0.95,
    });
    expect(result[1].metadata).toEqual({
      agent_id: 'agent-1',
      chunk_index: 0,
      relevance_score: 0.85,
    });
  });

  it('caps the result at vectorSearchMaxResults', async () => {
    env.VECTOR_SEARCH_MAX_RESULTS = 2;

    const documents = buildDocuments(5);

    mockRerankService.rerank.mockResolvedValue(
      documents.map((_, index) => ({ index, relevanceScore: 0.99 })),
    );

    const result = await service.execute().compressDocuments(documents, 'q');

    expect(result).toHaveLength(2);
  });

  it('does not call the API when there are no candidates', async () => {
    const result = await service.execute().compressDocuments([], 'q');

    expect(result).toEqual([]);
    expect(mockRerankService.rerank).not.toHaveBeenCalled();
  });

  it('returns empty and logs the best score when nothing clears the threshold', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    mockRerankService.rerank.mockResolvedValue([
      { index: 1, relevanceScore: 0.62 },
      { index: 0, relevanceScore: 0.41 },
    ]);

    const result = await service
      .execute()
      .compressDocuments(buildDocuments(2), 'q');

    expect(result).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('0.62'));

    warn.mockRestore();
  });
});
