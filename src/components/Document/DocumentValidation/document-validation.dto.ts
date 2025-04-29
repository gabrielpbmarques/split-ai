import { FaceMatchResult } from '../FaceMatch/face-match.service';
import { ExtractOcrTextResponse } from '../ExtractOcrText/extract-ocr-text.service';

export interface DocumentValidationMessage {
  workerId: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  profilePictureUrl?: string;
  timestamp: Date;
}

export interface DocumentValidationResponse
  extends FaceMatchResult,
    ExtractOcrTextResponse {
  errors: string[];
}
