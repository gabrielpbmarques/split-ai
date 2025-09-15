import { Test, TestingModule } from '@nestjs/testing';
import { ExtractOcrTextService } from 'src/components/Document/ExtractOcrText/extract-ocr-text.service';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { ProcessMessageDataService } from 'src/components/ArtificialIntelligence/MessageProcessing/ProcessMessageData/process-message-data.service';

describe('ExtractOcrTextService', () => {
  let service: ExtractOcrTextService;

  beforeEach(async () => {
    const mockProcessMessageDataService = {
      execute: jest.fn().mockResolvedValue({}),
    };

    const mockImageAnnotatorClient = {
      documentTextDetection: jest.fn().mockResolvedValue([
        {
          fullTextAnnotation: { text: 'Sample text' },
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtractOcrTextService,
        { provide: ImageAnnotatorClient, useValue: mockImageAnnotatorClient },
        {
          provide: ProcessMessageDataService,
          useValue: mockProcessMessageDataService,
        },
      ],
    }).compile();

    service = module.get<ExtractOcrTextService>(ExtractOcrTextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
