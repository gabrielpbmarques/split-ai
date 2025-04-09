import { Worker } from 'src/models/Worker.model';

export type RegisterContextMetadata = {
  user_id?: string;
  phone_number?: string;
  registration_stage?: string;
  is_new_user?: boolean;
  user_data?: Partial<Worker>;
};
