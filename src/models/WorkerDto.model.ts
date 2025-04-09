export interface WorkerDto {
  _id?: string;
  phoneId: string;
  signupStage: string;
  userId?: string;
  name?: string;
  email?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: string;
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
