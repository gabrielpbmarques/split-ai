import { Test, TestingModule } from '@nestjs/testing';
import { LoadVectorStoreService } from 'src/components/Langchain/LoadVectorStore/load-vector-store.service';

describe('LoadVectorStoreService', () => {
  let service: LoadVectorStoreService;

  const mockVertexAiEmbeddings = {
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
        { provide: 'VERTEX_AI_EMBEDDINGS', useValue: mockVertexAiEmbeddings },
        { provide: 'SUPABASE_CLIENT', useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<LoadVectorStoreService>(LoadVectorStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
