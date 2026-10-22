import { tool } from 'langchain';
import { z, type ZodTypeAny } from 'zod';

import type { AgentTool, ResponseFormat } from 'src/shared/contracts';

export function buildResponseFormatZodSchema(
  format: ResponseFormat,
): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  const requiredSet = new Set(format.required ?? []);

  for (const [key, prop] of Object.entries(format.properties ?? {})) {
    let fieldSchema: ZodTypeAny;

    switch (prop.type?.toLowerCase()) {
      case 'number':
        fieldSchema = z.number();
        break;
      case 'integer':
        fieldSchema = z.number().int();
        break;
      case 'boolean':
        fieldSchema = z.boolean();
        break;
      case 'array':
        fieldSchema = z.array(z.string());
        break;
      case 'object':
        fieldSchema = z.record(z.any(), z.any());
        break;
      case 'string':
      default:
        fieldSchema = z.string();
        break;
    }

    if (prop.description) {
      fieldSchema = fieldSchema.describe(prop.description);
    }

    if (!requiredSet.has(key)) {
      fieldSchema = fieldSchema.optional();
    }

    shape[key] = fieldSchema;
  }

  return z.object(shape);
}

export function buildLangchainToolFromSchema(
  responseFormat: ResponseFormat,
): AgentTool {
  const schema = buildResponseFormatZodSchema(responseFormat);
  return tool(async () => {}, {
    name: responseFormat.title,
    description: responseFormat.description,
    schema,
  });
}
