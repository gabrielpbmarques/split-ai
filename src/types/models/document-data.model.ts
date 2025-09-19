export type DocumentData = {
  documentNumber: string;
  cpf?: string;
  name: string;
  birthDate: string;
  issueDate: string;
  faceMatchScore: number;
  documentHasFace: boolean;
  selfieHasFace: boolean;
  isMatch: boolean;
  errors: string[];
};
