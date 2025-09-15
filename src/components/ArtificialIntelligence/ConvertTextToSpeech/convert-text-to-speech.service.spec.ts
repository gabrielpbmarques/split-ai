import { Test, TestingModule } from '@nestjs/testing';

import { ConvertTextToSpeechService } from './convert-text-to-speech.service';

describe('ConvertTextToSpeechService', () => {
  let service: ConvertTextToSpeechService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvertTextToSpeechService],
    }).compile();

    service = module.get<ConvertTextToSpeechService>(
      ConvertTextToSpeechService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
