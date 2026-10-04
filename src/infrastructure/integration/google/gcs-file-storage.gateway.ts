import { Storage } from '@google-cloud/storage';

import type { FileStorage } from 'src/infrastructure/integration/file-storage.port';
import type { IntegrationState } from 'src/infrastructure/integration/integration.state';
import { env } from 'src/shared/config/env';

export class GcsFileStorageGateway implements FileStorage {
  readonly name = 'gcs';

  private storage?: Storage;

  state(): IntegrationState {
    return 'READY';
  }

  async uploadAudio(localPath: string, fileName: string): Promise<string> {
    const bucket = this.client().bucket(env.GCS_AUDIO_BUCKET);

    await bucket.upload(localPath, {
      destination: fileName,
      metadata: { contentType: 'audio/mpeg' },
    });

    return `https://storage.googleapis.com/${env.GCS_AUDIO_BUCKET}/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.client().bucket(env.GCS_AUDIO_BUCKET).file(fileName).delete();
  }

  private client(): Storage {
    this.storage ??= new Storage();
    return this.storage;
  }
}
