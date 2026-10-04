import { ValidationError } from '@nestjs/common';

import { flattenValidationErrors } from 'src/shared/http/validation-pipe';

describe('flattenValidationErrors', () => {
  it('produces one detail per constraint, with nested paths joined by dots', () => {
    const errors: ValidationError[] = [
      {
        property: 'codigo',
        constraints: { isNotEmpty: 'codigo não pode ser vazio' },
        children: [],
      },
      {
        property: 'itens',
        children: [
          {
            property: '0',
            children: [
              {
                property: 'quantidade',
                constraints: {
                  min: 'quantidade deve ser maior que 0',
                  isInt: 'quantidade deve ser inteiro',
                },
                children: [],
              },
            ],
          },
        ],
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'codigo', message: 'codigo não pode ser vazio' },
      {
        field: 'itens.0.quantidade',
        message: 'quantidade deve ser maior que 0',
      },
      { field: 'itens.0.quantidade', message: 'quantidade deve ser inteiro' },
    ]);
  });
});
