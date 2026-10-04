import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  FILE_STORAGE,
  type FileStorage,
} from 'src/infrastructure/integration/file-storage.port';
import {
  TEXT_TO_SPEECH,
  type TextToSpeech,
} from 'src/infrastructure/integration/text-to-speech.port';

export interface ConvertTextToSpeechResult {
  audioPath: string;
  fileName: string;
  publicUrl: string;
}

@Injectable()
export class ConvertTextToSpeechService {
  constructor(
    @Inject(TEXT_TO_SPEECH) private readonly textToSpeech: TextToSpeech,
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
  ) {}

  async execute(text: string): Promise<ConvertTextToSpeechResult> {
    const audioContent = await this.textToSpeech.synthesize(text);

    const uploadsDir = path.join(process.cwd(), 'uploads', 'audio');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${uuidv4()}.mp3`;
    const audioPath = path.join(uploadsDir, fileName);

    await writeFile(audioPath, audioContent);

    const publicUrl = await this.fileStorage.uploadAudio(audioPath, fileName);

    return { audioPath, fileName, publicUrl };
  }
}
