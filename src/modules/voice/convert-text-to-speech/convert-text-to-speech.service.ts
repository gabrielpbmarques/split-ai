import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  GCP_STORAGE_SERVICE,
  type IGcpStorageService,
} from 'src/infrastructure/providers/gcp-storage.provider';
import {
  type ITextToSpeechService,
  TEXT_TO_SPEECH_SERVICE,
} from 'src/infrastructure/providers/text-to-speech.provider';

export interface ConvertTextToSpeechResult {
  audioPath: string;
  fileName: string;
  publicUrl: string;
}

@Injectable()
export class ConvertTextToSpeechService {
  constructor(
    @Inject(TEXT_TO_SPEECH_SERVICE)
    private readonly textToSpeech: ITextToSpeechService,
    @Inject(GCP_STORAGE_SERVICE)
    private readonly fileStorage: IGcpStorageService,
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
