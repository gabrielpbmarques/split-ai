export class DocumentValidationMessage {
  workerId: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  profilePictureUrl?: string;
  timestamp: Date;
}

export class DocumentValidationResult {
  workerId: string;
  isValid: boolean;
  errors?: string[];
  faceMatchScore?: number;
  documentAuthenticityScore?: number;
  validatedAt: Date;
}
