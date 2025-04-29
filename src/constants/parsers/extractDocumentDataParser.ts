import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Schema para validação dos dados extraídos de documentos de identidade.
 * Este schema está alinhado com a interface DocumentData e as instruções da IA.
 */
const extractDocumentDataParserSchema = z.object({
  documentNumber: z.string(),
  cpf: z.string().optional(),
  name: z.string(),
  birthDate: z.string(),
  issueDate: z.string(),
  errors: z.array(z.string()).default([]),
});

export const extractDocumentDataParserFormatter = tool(async () => {}, {
  name: 'extractDocumentDataParserFormatter',
  description:
    'Formata dados extraídos de documentos de identidade brasileiros via OCR',
  schema: extractDocumentDataParserSchema,
});
