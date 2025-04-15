export interface ProcessedImageInfo {
  type: string;
  url?: string;
  pictureId?: string;
  success: boolean;
  message: string;
  error?: string;
}

export class GenerateResponseDto {
  message: string;
  sessionId: string;
  phoneNumber: string;
  worker: any;
  isNewUser: boolean;
  processedImage?: ProcessedImageInfo | null;
  invalidFields?: Record<string, { value: string; reason: string }>;
}
