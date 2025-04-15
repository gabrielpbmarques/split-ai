import { Logger, Provider } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { config } from 'src/config';
import { v4 as uuidv4 } from 'uuid';

// Token para injeção do cliente S3
export const S3_CLIENT = 'S3_CLIENT';

// Interface para o serviço S3
export interface IS3Service {
  uploadBuffer(
    buffer: Buffer,
    folder?: string,
    extension?: string,
    contentType?: string,
  ): Promise<string>;
  uploadBase64Image(base64Image: string, folder?: string): Promise<string>;
}

// Token para injeção do serviço S3
export const S3_SERVICE = 'S3_SERVICE';

// Provider do cliente S3
export const S3ClientProvider: Provider = {
  provide: S3_CLIENT,
  useFactory: (): S3 => {
    const awsRegion = config.awsRegion;
    const awsAccessKeyId = config.awsAccessKeyId;
    const awsSecretAccessKey = config.awsSecretAccessKey;

    if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error('AWS credentials must be provided');
    }

    return new S3({
      region: awsRegion,
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    });
  },
};

// Provider do serviço S3
export const S3ServiceProvider: Provider = {
  provide: S3_SERVICE,
  useFactory: (s3: S3): IS3Service => {
    const logger = new Logger('S3Service');
    const bucketName = config.awsS3BucketName;

    return {
      /**
       * Faz upload de um buffer para o S3
       * @param buffer Buffer contendo os dados da imagem
       * @param folder Pasta onde a imagem será armazenada
       * @param extension Extensão do arquivo (sem o ponto)
       * @param contentType Tipo de conteúdo MIME
       * @returns URL da imagem no S3
       */
      async uploadBuffer(
        buffer: Buffer,
        folder: string = 'profile-pictures',
        extension: string = 'jpg',
        contentType: string = 'image/jpeg',
      ): Promise<string> {
        try {
          const fileName = `${folder}/${uuidv4()}.${extension}`;

          const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read',
          };

          const uploadResult = await s3.upload(params).promise();
          logger.log(
            `Buffer enviado com sucesso para: ${uploadResult.Location}`,
          );

          return uploadResult.Location;
        } catch (error) {
          logger.error(
            `Erro ao fazer upload do buffer: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      },

      /**
       * Faz upload de uma imagem em formato base64 para o S3
       * @param base64Image Imagem em formato base64
       * @param folder Pasta onde a imagem será armazenada
       * @returns URL da imagem no S3
       */
      async uploadBase64Image(
        base64Image: string,
        folder: string = 'profile-pictures',
      ): Promise<string> {
        try {
          // Remove o prefixo data:image/jpeg;base64, se existir
          const base64Data = base64Image.replace(
            /^data:image\/\w+;base64,/,
            '',
          );
          const buffer = Buffer.from(base64Data, 'base64');

          // Determina o tipo de conteúdo a partir do prefixo, se disponível
          let contentType = 'image/jpeg';
          if (base64Image.startsWith('data:')) {
            const match = base64Image.match(/^data:(image\/[\w-+.]+);base64,/);
            if (match) {
              contentType = match[1];
            }
          }

          // Determina a extensão com base no tipo de conteúdo
          const extension = getExtensionFromContentType(contentType);

          return this.uploadBuffer(buffer, folder, extension, contentType);
        } catch (error) {
          logger.error(
            `Erro ao fazer upload da imagem base64: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      },
    };
  },
  inject: [S3_CLIENT],
};

// Array com todos os providers do S3
export const S3Provider = [S3ClientProvider, S3ServiceProvider];

/**
 * Determina a extensão do arquivo com base no tipo de conteúdo MIME
 * @param contentType Tipo de conteúdo MIME
 * @returns Extensão do arquivo sem o ponto
 */
function getExtensionFromContentType(contentType: string): string {
  const contentTypeToExt = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
  };

  return contentTypeToExt[contentType] || 'jpg';
}
