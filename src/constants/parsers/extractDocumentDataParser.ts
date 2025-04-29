import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const extractDocumentDataParserSchema = z.object({
  // Campos principais do RG
  rg: z.string().optional(),
  cpf: z.string().optional(),
  name: z.string().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  issueDate: z.string().optional(),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
  rgIssuer: z.string().optional(),

  // Campo legado (mantido para compatibilidade)
  documentNumber: z.string().optional(),

  // Campos adicionais que podem ser úteis
  gender: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),

  // Campos para controle de qualidade
  faceMatchScore: z.number().optional(),
  errors: z.array(z.string()).optional(),
});

export const extractDocumentDataParserFormatter = tool(async () => {}, {
  name: 'extractDocumentDataParserFormatter',
  description:
    'Formata dados extraídos de documentos de identidade brasileiros via OCR',
  schema: extractDocumentDataParserSchema,
});
