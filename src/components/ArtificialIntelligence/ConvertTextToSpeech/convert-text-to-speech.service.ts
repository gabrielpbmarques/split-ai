import path from 'path';

import { Injectable, Inject } from '@nestjs/common';
import fs from 'fs-extra';
import {
  GCP_STORAGE_SERVICE,
  GcpStorageService,
} from 'src/infrastructure/providers/gcp-storage.provider';
import {
  GOOGLE_VOICE_SERVICE,
  GoogleVoiceService,
} from 'src/infrastructure/providers/google-voice.provider';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConvertTextToSpeechService {
  constructor(
    @Inject(GOOGLE_VOICE_SERVICE)
    private readonly googleVoiceService: GoogleVoiceService,
    @Inject(GCP_STORAGE_SERVICE)
    private readonly gcpStorageService: GcpStorageService,
  ) {}

  async execute(
    text: string,
  ): Promise<{ audioPath: string; fileName: string; publicUrl: string }> {
    const audioContent = await this.googleVoiceService.textToSpeech(text);

    if (!audioContent) {
      throw new Error('Failed to convert text to speech');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'audio');
    await fs.ensureDir(uploadsDir);

    // Generate unique filename
    const fileName = `${uuidv4()}.mp3`;
    const audioPath = path.join(uploadsDir, fileName);

    // Save audio content to file
    await fs.writeFile(audioPath, audioContent);

    // Upload the file to GCP bucket
    const publicUrl = await this.gcpStorageService.uploadMp3File(
      audioPath,
      fileName,
    );

    return {
      audioPath,
      fileName,
      publicUrl,
    };
  }
}
