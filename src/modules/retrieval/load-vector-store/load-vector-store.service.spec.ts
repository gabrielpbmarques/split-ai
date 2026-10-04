import { Test, TestingModule } from '@nestjs/testing';

import { SUPABASE_CLIENT } from 'src/infrastructure/supabase/supabase.tokens';
import { VOYAGE_EMBEDDINGS } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.tokens';
import { LoadVectorStoreService } from 'src/modules/retrieval/load-vector-store/load-vector-store.service';

describe('LoadVectorStoreService', () => {
  let service: LoadVectorStoreService;

  const mockEmbeddings = {
    embedQuery: jest.fn().mockResolvedValue([]),
    embedDocuments: jest.fn().mockResolvedValue([]),
  };

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadVectorStoreService,
        { provide: VOYAGE_EMBEDDINGS, useValue: mockEmbeddings },
        { provide: SUPABASE_CLIENT, useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<LoadVectorStoreService>(LoadVectorStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
