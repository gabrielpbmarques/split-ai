import {
  buildLangchainToolFromSchema,
  buildResponseFormatZodSchema,
} from 'src/shared/utils/build-zod-schema';

describe('build-zod-schema', () => {
  it('converts ResponseFormat into a valid Zod object schema with required and optional fields', () => {
    const schema = buildResponseFormatZodSchema({
      title: 'extrair_dados',
      description: 'Extrai dados da conversa',
      properties: {
        nome: { type: 'string', description: 'Nome do cliente' },
        idade: { type: 'number', description: 'Idade do cliente' },
        ativo: { type: 'boolean', description: 'Status ativo' },
      },
      required: ['nome'],
    });

    const parsedValid = schema.safeParse({ nome: 'Gabriel' });
    expect(parsedValid.success).toBe(true);

    const parsedMissingRequired = schema.safeParse({ idade: 25 });
    expect(parsedMissingRequired.success).toBe(false);

    const parsedFull = schema.safeParse({
      nome: 'Gabriel',
      idade: 30,
      ativo: true,
    });
    expect(parsedFull.success).toBe(true);
  });

  it('builds an inert langchain tool with title, description and schema', async () => {
    const responseFormat = {
      title: 'buscar_pedido',
      description: 'Busca pedidos por código',
      properties: {
        codigo: { type: 'string', description: 'Código do pedido' },
      },
      required: ['codigo'],
    };

    const tool = buildLangchainToolFromSchema(responseFormat);

    expect(tool.name).toBe('buscar_pedido');
    expect(tool.description).toBe('Busca pedidos por código');

    const result = await (tool as any).func({ codigo: '123' });
    expect(result).toBeUndefined();
  });
});
