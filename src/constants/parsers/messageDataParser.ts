import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Create a simplified schema that's compatible with Gemini's tool format
// Avoid using nullable types or anyOf with null as they cause issues with Gemini
const messageDataParserSchema = z.object({
  name: z.string().optional(),
  nickname: z.string().optional(),
  phone: z
    .object({
      countryCode: z.string(),
      areaCode: z.string(),
      number: z.string(),
    })
    .optional(),
  bankInfo: z
    .object({
      bankCode: z.string(),
      agency: z.string(),
      account: z.string(),
      accountDigit: z.string(),
      type: z.string(),
      name: z.string(),
      cpf: z.string(),
    })
    .optional(),
  email: z.string().optional(),
  birthDate: z.string().optional(),
  cpf: z.string().optional(),
  password: z.string().optional(),
  gender: z.enum(['female', 'male', 'uninformed']).optional(),
  comunication: z
    .object({
      agree: z.boolean(),
    })
    .optional(),
  terms: z
    .object({
      agree: z.boolean(),
    })
    .optional(),
  image: z
    .object({
      type: z.enum([
        'document_front',
        'document_back',
        't_shirt_selfie',
        'profile',
      ]),
      url: z.string(),
    })
    .optional(),
  hasPassport: z.boolean().optional(),
  hasLegalAge: z.boolean().optional(),
  status: z.enum(['pending', 'inAnalysis']),
  signupStage: z.enum([
    'personal_info',
    'password',
    'address',
    'bank_account',
    'profile_picture',
    'document',
    't_shirt_selfie',
    'end',
  ]),
  fieldsToUpdate: z
    .array(
      z.enum([
        'name',
        'nickname',
        'phone',
        'email',
        'birthDate',
        'cpf',
        'gender',
        'comunication',
        'terms',
        'hasLegalAge',
        'address.zipCode',
        'address.street',
        'address.number',
        'address.complement',
        'address.neighborhood',
        'address.city',
        'address.state',
        'address.country',
        'address.cityCode',
        'profilePictureId',
        'document.rgBackId',
        'document.rgFrontId',
        'document.tShirtSelfieId',
        'bankAccount.bankCode',
        'bankAccount.agency',
        'bankAccount.account',
        'bankAccount.accountDigit',
        'bankAccount.type',
        'bankAccount.pixKey',
        'password',
      ]),
    )
    .optional(),
  address: z
    .object({
      zipCode: z.string(),
      street: z.string(),
      number: z.string(),
      complement: z.string().optional(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      cityCode: z.number().optional(),
    })
    .optional(),
  resetPassword: z.boolean().optional().default(false),
  invalidFields: z
    .array(
      z.object({
        field: z.string(),
        value: z.string(),
        reason: z.string(),
      }),
    )
    .optional(),
});

// Create a tool with a simplified schema and a description
export const messageDataParserFormatter = tool(async () => {}, {
  name: 'messageDataParserFormatter',
  description: 'Formata dados de cadastro do usuário em JSON',
  schema: messageDataParserSchema,
});
