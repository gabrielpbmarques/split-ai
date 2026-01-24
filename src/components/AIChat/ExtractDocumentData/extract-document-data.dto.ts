import { IsObject, IsString } from 'class-validator';

export class ExtractDocumentDataDto {
  @IsString()
  fileId: string;

  @IsObject()
  customMetadata?: Record<string, any>;
}
