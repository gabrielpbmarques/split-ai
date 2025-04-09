export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  password?: string;
  signupStage?: string;
  birthDate?: Date;
  gender?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
