import { Storage } from '@google-cloud/storage';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class GcpStorageService {
  private readonly storage: Storage;
  private readonly bucketName: string = 'alert-calls-audios';

  constructor(private configService: ConfigService) {
    this.storage = new Storage();
  }

  /**
   * Uploads an MP3 file to the GCP bucket
   * @param filePath Path to the MP3 file to upload
   * @param fileName Name to use for the file in the bucket
   * @returns URL of the uploaded file
   */
  async uploadMp3File(filePath: string, fileName: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);

      // Upload the file to the bucket
      await bucket.upload(filePath, {
        destination: fileName,
        metadata: {
          contentType: 'audio/mpeg',
        },
      });

      // Note: We're not calling makePublic() because the bucket has uniform bucket-level access enabled
      // Access control must be configured at the bucket level via IAM policies

      // Return the URL (access depends on bucket's IAM configuration)
      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    } catch (error: any) {
      console.error('Error uploading file to GCP bucket:', error);
      throw new Error(`Failed to upload file to GCP bucket: ${error.message}`);
    }
  }

  /**
   * Deletes an MP3 file from the GCP bucket
   * @param fileName Name of the file to delete
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      await bucket.file(fileName).delete();
    } catch (error: any) {
      console.error('Error deleting file from GCP bucket:', error);
      throw new Error(
        `Failed to delete file from GCP bucket: ${error.message}`,
      );
    }
  }
}

export const GCP_STORAGE_SERVICE = 'GCP_STORAGE_SERVICE';

export const GcpStorageProvider: Provider[] = [
  {
    provide: GCP_STORAGE_SERVICE,
    useFactory: (configService: ConfigService): GcpStorageService => {
      return new GcpStorageService(configService);
    },
    inject: [ConfigService],
  },
];
