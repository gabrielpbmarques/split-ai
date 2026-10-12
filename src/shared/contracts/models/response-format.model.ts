export interface ResponseFormat {
  title: string;
  description: string;
  properties: Record<string, { type: string; description: string }>;
  required: string[];
}

export type ResponseFormmat = ResponseFormat;
