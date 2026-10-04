import fs from 'fs-extra';

import { ConvertTextToSpeechService } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.service';

jest.mock('fs-extra', () => ({
  __esModule: true,
  default: { ensureDir: jest.fn(), writeFile: jest.fn() },
}));

describe('ConvertTextToSpeechService', () => {
  const textToSpeech = {
    name: 'tts',
    state: () => 'MOCK',
    synthesize: jest.fn(),
  };
  const fileStorage = {
    name: 'storage',
    state: () => 'MOCK',
    uploadAudio: jest.fn().mockResolvedValue('https://bucket/file.mp3'),
    deleteFile: jest.fn(),
  };
  const service = new ConvertTextToSpeechService(
    textToSpeech as any,
    fileStorage as any,
  );

  beforeEach(() => jest.clearAllMocks());

  it('synthesizes, writes the mp3 locally and uploads it', async () => {
    textToSpeech.synthesize.mockResolvedValue(new Uint8Array([1, 2, 3]));

    const result = await service.execute('olá');

    expect(textToSpeech.synthesize).toHaveBeenCalledWith('olá');
    expect(fs.writeFile).toHaveBeenCalled();
    expect(fileStorage.uploadAudio).toHaveBeenCalledWith(
      result.audioPath,
      result.fileName,
    );
    expect(result).toMatchObject({ publicUrl: 'https://bucket/file.mp3' });
    expect(result.fileName).toMatch(/\.mp3$/);
  });

  it('propagates a failure from the voice provider without uploading', async () => {
    textToSpeech.synthesize.mockRejectedValue(new Error('voz indisponível'));

    await expect(service.execute('olá')).rejects.toThrow('voz indisponível');
    expect(fileStorage.uploadAudio).not.toHaveBeenCalled();
  });
});
