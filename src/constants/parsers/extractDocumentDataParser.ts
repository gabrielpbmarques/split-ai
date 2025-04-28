import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const extractDocumentDataParserSchema = z.object({
  documentNumber: z.string().optional(),
  cpf: z.string().optional(),
  name: z.string().optional(),
  birthDate: z.string().optional(),
  issueDate: z.string().optional(),
  faceMatchScore: z.number().optional(),
  errors: z.array(z.string()).optional(),
});

export const extractDocumentDataParserFormatter = tool(async () => {}, {
  name: 'extractDocumentDataParserFormatter',
  description: 'Formata dados de textos extraídos de leitura OCR de documentos',
  schema: extractDocumentDataParserSchema,
});
