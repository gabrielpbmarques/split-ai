import { ObjectId } from 'mongoose';
import { PixObject } from './Worker.model';

/**
 * Modelo para os dados do worker armazenados na sessão
 * Contém apenas os dados necessários para o contexto da conversa
 * Exclui dados sensíveis e temporários
 */
export interface SessionWorkerData {
  _id?: ObjectId;
  name?: string;
  nickname?: string;
  email?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: string;
  phone?: {
    countryCode?: string;
    areaCode?: string;
    number?: string;
  };
  address?: {
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    cityCode?: number;
  };
  pix?: PixObject;
  documents?: {
    rgFrontId?: string;
    rgBackId?: string;
    tShirtSelfieId?: string;
    addressPictureId?: string | null;
    status?: string;
    isRemoved?: boolean;
    removedAt?: Date | null;
    observations?: string[];
    dateValidated?: Date | null;
    validator?: string | null;
    documentValidationResult?: {
      documentNumber?: string;
      cpf?: string;
      name?: string;
      birthDate?: string;
      issueDate?: string;
      faceMatchScore?: number;
      documentHasFace?: boolean;
      selfieHasFace?: boolean;
      isMatch?: boolean;
      errors?: string[];
    };
  };
  signupStage: string;
  status?: string;
  userId?: string;
  isNewUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Lista de campos que não devem ser armazenados na sessão
 */
export const sensitiveOrTemporaryFields = [
  'password',
  'fieldsToUpdate',
  'isConfirmation',
  'image',
  'finalizeRegistration',
  'documentResending',
  'resetPassword',
  'invalidFields',
];

/**
 * Filtra os dados do worker para remover campos sensíveis ou temporários
 * @param workerData Dados completos do worker
 * @returns Dados filtrados para armazenamento na sessão
 */
export function filterSessionWorkerData(workerData: any): SessionWorkerData {
  if (!workerData) return { signupStage: 'personal_info' };

  // Cria uma cópia para não modificar o objeto original
  const filteredData = { ...workerData };

  // Remove campos sensíveis ou temporários
  sensitiveOrTemporaryFields.forEach((field) => {
    delete filteredData[field];
  });

  return filteredData;
}
