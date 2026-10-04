import { tool } from 'langchain';
import { z, type ZodTypeAny } from 'zod';

import type { AgentTool } from 'src/shared/contracts';

type SchemaDef = {
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  optional?: boolean;
  enum?: string[];
  default?: unknown;
  description?: string;
  properties?: Record<string, SchemaDef>;
  items?: SchemaDef;
};

export function buildZodSchema(def: SchemaDef): ZodTypeAny {
  let schema: ZodTypeAny;

  if (def.enum && def.enum.length) {
    schema = z.enum(def.enum as [string, ...string[]]);
  } else {
    switch (def.type) {
      case 'string':
        schema = z.string();
        break;
      case 'number':
        schema = z.number();
        break;
      case 'boolean':
        schema = z.boolean();
        break;
      case 'array':
        schema = z.array(buildZodSchema(def.items || { type: 'string' }));
        break;
      case 'object':
      default: {
        const props = def.properties || {};
        const shape: Record<string, ZodTypeAny> = {};
        for (const key of Object.keys(props)) {
          const child = buildZodSchema(props[key]);
          shape[key] = props[key].optional ? child.optional() : child;
          if (Object.prototype.hasOwnProperty.call(props[key], 'default')) {
            shape[key] = shape[key]
              .default(props[key].default)
              .describe(props[key].description ?? '');
          }
        }
        schema = z.object(shape);
        break;
      }
    }
  }

  if (def.optional) schema = schema.optional();
  if (Object.prototype.hasOwnProperty.call(def, 'default'))
    schema = schema.default(def.default);

  return schema;
}

export function buildLangchainToolFromSchema(
  name: string,
  description: string,
  def: SchemaDef,
): AgentTool {
  const schema = buildZodSchema(def);
  return tool(async () => {}, {
    name,
    description,
    schema: schema as z.ZodObject<z.ZodRawShape>,
  });
}
