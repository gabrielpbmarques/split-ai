export type CustomMetadata = {
  user_id?: string;
  phone_number?: string;
  registration_stage?: string;
  agent_id?: string;
  source_type?: string;
  is_new_user?: boolean;
  user_data?: {
    name?: string;
    email?: string;
    cpf?: string;
    birthDate?: string;
    [key: string]: any; // Permite campos adicionais conforme necessário
  };
};
