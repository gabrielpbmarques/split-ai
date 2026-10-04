import { Test, TestingModule } from '@nestjs/testing';

import { ConvertTextToSpeechService } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.service';

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
