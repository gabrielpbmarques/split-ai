import { ExtractOcrTextResponse } from 'src/components/OCR/ExtractOcrText/extract-ocr-text.service';
import { FaceMatchResult } from 'src/components/ComputerVision/FaceMatch/face-match.service';

export interface DocumentValidationMessage {
  workerId: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  profilePictureUrl?: string;
  timestamp?: Date;
}

export interface DocumentValidationResponse
  extends FaceMatchResult,
    ExtractOcrTextResponse {
  errors: string[];
}
