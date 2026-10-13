import { Storage } from '@google-cloud/storage';
import type { Provider } from '@nestjs/common';

import { env } from 'src/shared/config/env';

export const GCP_STORAGE_SERVICE = 'GCP_STORAGE_SERVICE';

export interface IGcpStorageService {
  uploadAudio(localPath: string, fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
}

class GcpStorageService implements IGcpStorageService {
  private storage?: Storage;

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

class MockGcpStorageService implements IGcpStorageService {
  readonly uploaded: string[] = [];

  async uploadAudio(_localPath: string, fileName: string): Promise<string> {
    this.uploaded.push(fileName);
    return `https://storage.mock.local/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    const index = this.uploaded.indexOf(fileName);
    if (index >= 0) this.uploaded.splice(index, 1);
  }
}

export const GcpStorageProvider: Provider[] = [
  {
    provide: GCP_STORAGE_SERVICE,
    useFactory: (): IGcpStorageService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockGcpStorageService();
      }
      return new GcpStorageService();
    },
  },
];
