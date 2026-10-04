import { Storage } from '@google-cloud/storage';
import { Logger, Provider } from '@nestjs/common';

import { GCP_STORAGE_SERVICE } from 'src/infrastructure/gcp-storage/gcp-storage.tokens';

export class GcpStorageService {
  private readonly logger = new Logger(GcpStorageService.name);
  private readonly storage: Storage;
  private readonly bucketName: string = 'alert-calls-audios';

  constructor() {
    this.storage = new Storage();
  }

  async uploadMp3File(filePath: string, fileName: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);

      await bucket.upload(filePath, {
        destination: fileName,
        metadata: {
          contentType: 'audio/mpeg',
        },
      });

      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    } catch (error: any) {
      this.logger.error('Error uploading file to GCP bucket', error);
      throw new Error(`Failed to upload file to GCP bucket: ${error.message}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      await bucket.file(fileName).delete();
    } catch (error: any) {
      this.logger.error('Error deleting file from GCP bucket', error);
      throw new Error(
        `Failed to delete file from GCP bucket: ${error.message}`,
      );
    }
  }
}

export const GcpStorageProvider: Provider[] = [
  {
    provide: GCP_STORAGE_SERVICE,
    useFactory: (): GcpStorageService => new GcpStorageService(),
  },
];
