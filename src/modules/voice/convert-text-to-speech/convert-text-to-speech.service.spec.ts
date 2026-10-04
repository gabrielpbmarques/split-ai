import fs from 'fs-extra';

import { ConvertTextToSpeechService } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.service';

jest.mock('fs-extra', () => ({
  __esModule: true,
  default: { ensureDir: jest.fn(), writeFile: jest.fn() },
}));

describe('ConvertTextToSpeechService', () => {
  const googleVoice = { textToSpeech: jest.fn() };
  const gcpStorage = {
    uploadMp3File: jest.fn().mockResolvedValue('https://bucket/file.mp3'),
  };
  const service = new ConvertTextToSpeechService(
    googleVoice as any,
    gcpStorage as any,
  );

  beforeEach(() => jest.clearAllMocks());

  it('synthesizes, writes the mp3 locally and uploads it', async () => {
    googleVoice.textToSpeech.mockResolvedValue(new Uint8Array([1, 2, 3]));

    const result = await service.execute('olá');

    expect(googleVoice.textToSpeech).toHaveBeenCalledWith('olá');
    expect(fs.writeFile).toHaveBeenCalled();
    expect(gcpStorage.uploadMp3File).toHaveBeenCalledWith(
      result.audioPath,
      result.fileName,
    );
    expect(result).toMatchObject({ publicUrl: 'https://bucket/file.mp3' });
    expect(result.fileName).toMatch(/\.mp3$/);
  });

  it('fails when the voice provider returns nothing', async () => {
    googleVoice.textToSpeech.mockResolvedValue(null);

    await expect(service.execute('olá')).rejects.toThrow();
    expect(gcpStorage.uploadMp3File).not.toHaveBeenCalled();
  });
});
