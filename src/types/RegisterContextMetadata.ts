import { Worker } from 'src/models/Worker.model';
import { ProcessedImageInfo } from 'src/components/Register/GenerateResponse/generate-response.dto';

export type RegisterContextMetadata = {
  user_id?: string;
  phone_number?: string;
  registration_stage?: string;
  is_new_user?: boolean;
  user_data?: Partial<Worker>;
  processed_image?: ProcessedImageInfo | null;
  invalid_fields?: Record<string, { value: string; reason: string }>;
  fields_to_update?: string[];
};
